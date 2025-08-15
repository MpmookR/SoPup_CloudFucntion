import admin from "../config/firebaseAdmin";

import { Message } from "../models/Chat/Message";
import { MeetupStatus, MessageType } from "../models/config";
import { MeetupRequest } from "../models/Chat/MeetupRequest";
import { MeetupSummaryDTO } from "../models/DTO/meetupSummaryDTO";

import {
  addMeetupMessageToChatRoom,
  updateLastMessageInChatRoom,
} from "../repositories/chatRepository";

import {
  createMeetup,
  updateMeetup,
  getMeetupsByUserAndDirection,
  getMeetupsForUserWithStatus,
  getMeetupById,
} from "../repositories/meetupRepository";

import { getUserById, getPushTokenByUserId } from "../repositories/userRepository";
import { getDogById } from "../repositories/dogRepository";

import { sendPushNotification } from "./notificationService";

// ===== Minimum functions to be used in the meetup service =====
// check if the user is a participant of the meetup
const isParticipant = (meetup: MeetupRequest, userId: string) =>
  userId === meetup.senderId || userId === meetup.receiverId;

// get the other user id of the meetup
const otherUserIdOf = (meetup: MeetupRequest, userId: string) =>
  userId === meetup.senderId ? meetup.receiverId : meetup.senderId;

// send push notification to the user
const notify = async (userId: string, title: string, body: string, data: Record<string, any>) => {
  const token = await getPushTokenByUserId(userId);
  if (token) {
    await sendPushNotification(token, { title, body, data });
  }
};

// Mapper: MeetupRequest -> MeetupSummaryDTO
const toMeetupSummaryDTO = async (
  meetup: MeetupRequest,
  currentUserId: string
): Promise<MeetupSummaryDTO> => {
  const isSender = meetup.senderId === currentUserId;
  const otherUserId = isSender ? meetup.receiverId : meetup.senderId;
  const otherDogId = isSender ? meetup.receiverDogId : meetup.senderDogId;

  const [otherUser, otherDog] = await Promise.all([
    getUserById(otherUserId),
    getDogById(otherDogId),
  ]);

  return {
    id: meetup.id,
    chatRoomId: meetup.chatRoomId,
    proposedTime: meetup.proposedTime,
    locationName: meetup.locationName,
    status: meetup.status,
    otherUserId,
    otherUserName: otherUser?.name || "Unknown",
    otherDogId,
    otherDogName: otherDog?.name || "Dog",
    otherDogImageUrl: otherDog?.imageURLs?.[0] || "",
  };
};

// Create meet-up
export const createMeetupRequest = async (
  chatRoomId: string,
  meetup: MeetupRequest,
  senderId: string,
  receiverId: string,
  senderDogId: string,
  receiverDogId: string
): Promise<Message> => {
  // 1) Validate Puppy Mode
  const [senderDog, receiverDog] = await Promise.all([
    getDogById(senderDogId),
    getDogById(receiverDogId),
  ]);
  if (!senderDog || !receiverDog) throw new Error("Dog not found");

  const isPuppyMode = senderDog.mode === "puppy" || receiverDog.mode === "puppy";
  if (isPuppyMode) {
    throw new Error("Meet-up creation is disabled while either dog is in Puppy Mode.");
  }
  console.log(`✅ is one of the user in Puppy Mode: ${isPuppyMode}`);

  // 2) Create meet-up
  const meetupId = `meetup_${chatRoomId}_${Date.now()}`;
  const now = new Date();
  const newMeetup: MeetupRequest = {
    ...meetup,
    id: meetupId,
    chatRoomId,
    senderId,
    senderDogId,
    receiverId,
    receiverDogId,
    status: MeetupStatus.pending,
    createdAt: now,
    updatedAt: now,
  };

  await createMeetup(newMeetup);
  console.log(`✅ Created Meet-Up Request: ${meetupId} in chat room ${chatRoomId}`);

  const message: Message = {
    id: meetupId,
    text: "📨 Meet-Up Request sent!",
    senderId,
    receiverId,
    senderDogId,
    receiverDogId,
    timestamp: now,
    messageType: MessageType.meetupRequest,
    meetupId,
  };

  await addMeetupMessageToChatRoom(chatRoomId, { ...message, meetupId });
  await updateLastMessageInChatRoom(chatRoomId, {
    text: message.text,
    timestamp: message.timestamp,
    senderId,
    messageType: message.messageType,
  });

  await notify(receiverId, "📨 New Meet-Up Request", "You have a new meet-up request", {
    chatRoomId,
    messageType: message.messageType,
  });

  // Return fresh message object
  return { ...message, timestamp: new Date() } as Message;
};

// Update status: accept / reject
export const updateMeetupStatus = async (
  chatRoomId: string,
  meetupId: string,
  status: MeetupStatus,
  senderId: string,
  receiverId: string
): Promise<void> => {
  const now = new Date();
  const text = status === "accepted" ? "✅ Meet-Up Accepted" : "❌ Meet-Up Rejected";

  // 1) Update meetups collection
  await updateMeetup(meetupId, { status, updatedAt: now });
  console.log(`✅ Updated Meet-Up ${meetupId} status to ${status}`);

  // 2) Update the latest meetup message (found by query) — keeping your working approach
  const messageSnapshot = await admin
    .firestore()
    .collection("chatRooms")
    .doc(chatRoomId)
    .collection("messages")
    .where("meetupId", "==", meetupId)
    .where("messageType", "==", "meetupRequest")
    .orderBy("timestamp", "desc")
    .limit(1)
    .get();

  if (!messageSnapshot.empty) {
    await messageSnapshot.docs[0].ref.update({ text, timestamp: now });
  } else {
    console.warn(`⚠️ No matching message found for meetupId ${meetupId}`);
  }

  // 3) Update last message
  await updateLastMessageInChatRoom(chatRoomId, {
    text,
    timestamp: now,
    senderId,
    messageType: MessageType.system,
  });

  // 4) Notify on accept
  if (status === "accepted") {
    await notify(
      receiverId,
      "✅ Meet-Up Accepted",
      "Your match has accepted the meet-up request!",
      {
        chatRoomId,
      }
    );
  }
};

// Cancel meet-up (only when accepted)
export const cancelMeetupRequest = async (
  chatRoomId: string,
  meetupId: string,
  requesterUserId: string
): Promise<void> => {
  const now = new Date();

  // 1) Validate
  const meetup = await getMeetupById(meetupId);
  if (!meetup) throw new Error("Meet-up not found");
  if (!isParticipant(meetup, requesterUserId)) {
    const e: any = new Error("You are not a participant of this meet-up");
    e.status = 403;
    throw e;
  }
  if (meetup.status !== MeetupStatus.accepted) {
    const e: any = new Error("Only accepted meet-ups can be cancelled");
    e.status = 409;
    throw e;
  }

  // 2) Persist
  await updateMeetup(meetupId, { status: MeetupStatus.cancelled, updatedAt: now });

  // 3) Append system message
  await addMeetupMessageToChatRoom(chatRoomId, {
    id: `cancel_${meetupId}_${now.getTime()}`,
    text: "❌ Meet-Up Cancelled",
    senderId: requesterUserId,
    receiverId: otherUserIdOf(meetup, requesterUserId),
    senderDogId: meetup.senderDogId,
    receiverDogId: meetup.receiverDogId,
    timestamp: now,
    messageType: MessageType.system,
    meetupId,
  });

  // 4) Update last message
  await updateLastMessageInChatRoom(chatRoomId, {
    text: "❌ Meet-Up Cancelled",
    timestamp: now,
    senderId: requesterUserId,
    messageType: MessageType.system,
  });

  // 5) Notify
  await notify(
    otherUserIdOf(meetup, requesterUserId),
    "❌ Meet-Up Cancelled",
    "The accepted meet-up has been cancelled.",
    { chatRoomId }
  );
};

// Complete meet-up (manual) 
export const completeMeetupRequest = async (
  chatRoomId: string,
  meetupId: string,
  requesterUserId: string
): Promise<void> => {
  const now = new Date();

  // 1) Validate
  const meetup = await getMeetupById(meetupId);
  if (!meetup) throw new Error("Meet-up not found");
  if (!isParticipant(meetup, requesterUserId)) {
    const e: any = new Error("You are not a participant of this meet-up");
    e.status = 403;
    throw e;
  }
  if (meetup.status !== MeetupStatus.accepted) {
    const e: any = new Error("Only accepted meet-ups can be completed");
    e.status = 409;
    throw e;
  }

  // 2) Persist
  await updateMeetup(meetupId, { status: MeetupStatus.completed, updatedAt: now });

  // 3) Append system message
  await addMeetupMessageToChatRoom(chatRoomId, {
    id: `completed_${meetupId}_${now.getTime()}`,
    text: "✅ Meet-Up marked as completed. You can now leave a review.",
    senderId: requesterUserId,
    receiverId: otherUserIdOf(meetup, requesterUserId),
    senderDogId: meetup.senderDogId,
    receiverDogId: meetup.receiverDogId,
    timestamp: now,
    messageType: MessageType.system,
    meetupId,
  });

  // 4) Update last message
  await updateLastMessageInChatRoom(chatRoomId, {
    text: "✅ Meet-Up Completed",
    timestamp: now,
    senderId: requesterUserId,
    messageType: MessageType.system,
  });

  // 5) Notify
  await notify(
    otherUserIdOf(meetup, requesterUserId),
    "✅ Meet-Up Completed",
    "Your meet-up has been marked as completed. You can now leave a review.",
    { chatRoomId, meetupId, status: MeetupStatus.completed }
  );
};

// Fetch: by type or all
export const fetchMeetupsByType = async (
  userId: string,
  type: "incoming" | "outgoing",
  status?: MeetupStatus
): Promise<MeetupSummaryDTO[]> => {
  const rows = await getMeetupsByUserAndDirection(userId, type, status);
  const mapped = await Promise.all(rows.map((m) => toMeetupSummaryDTO(m, userId)));
  return mapped.sort((a, b) => a.proposedTime.getTime() - b.proposedTime.getTime());
};

export const fetchAllMeetupsForUser = async (
  userId: string,
  status?: MeetupStatus
): Promise<MeetupSummaryDTO[]> => {
  const rows = await getMeetupsForUserWithStatus(userId, status);
  const mapped = await Promise.all(rows.map((m) => toMeetupSummaryDTO(m, userId)));
  return mapped.sort((a, b) => a.proposedTime.getTime() - b.proposedTime.getTime());
};
