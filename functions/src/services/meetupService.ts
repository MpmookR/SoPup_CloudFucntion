import admin from "../config/firebaseAdmin";
import { Message } from "../models/Chat/Message";
import { MeetupStatus, MessageType } from "../models/config";
import { MeetupRequest } from "../models/Chat/MeetupRequest";
import { MeetupSummaryDTO } from "../models/DTO/meetupSummaryDTO";
import {
  addMeetupMessageToChatRoom,
  updateLastMessageInChatRoom,
  updateMessageInChatRoom,
} from "../repositories/chatRepository";
import { createMeetup, updateMeetup, getMeetupsForUser } from "../repositories/meetupRepository";

import { getUserById, getPushTokenByUserId } from "../repositories/userRepository";
import { getDogById } from "../repositories/dogRepository";
import { sendPushNotification } from "./notificationService";

// Mapper: MeetupRequest => MeetupSummaryDTO
const toMeetupSummaryDTO = async (
  meetup: MeetupRequest,
  currentUserId: string
): Promise<MeetupSummaryDTO> => {
  const isSender = meetup.senderId === currentUserId;
  const otherUserId = isSender ? meetup.receiverId : meetup.senderId;
  const otherDogId = isSender ? meetup.receiverDogId : meetup.senderDogId;

  const otherUser = await getUserById(otherUserId);
  const otherDog = await getDogById(otherDogId);

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

// Create initial Meet-Up Request
export const createMeetupRequest = async (
  chatRoomId: string,
  meetup: MeetupRequest,
  senderId: string,
  receiverId: string,
  senderDogId: string,
  receiverDogId: string
): Promise<Message> => {
  // 1. Validate Puppy Mode
  const [senderDog, receiverDog] = await Promise.all([
    getDogById(senderDogId),
    getDogById(receiverDogId),
  ]);

  if (!senderDog || !receiverDog) {
    throw new Error("Dog not found");
  }

  const isPuppyMode = senderDog.mode === "puppy" || receiverDog.mode === "puppy";
  if (isPuppyMode) {
    throw new Error("Meet-up creation is disabled while either dog is in Puppy Mode.");
  }
  console.log(`✅ is one of the user in Puppy Mode: ${isPuppyMode}`);

  // 2. Create Meet-Up Request
  const meetupId = `meetup_${chatRoomId}_${Date.now()}`;
  const newMeetup: MeetupRequest = {
    ...meetup,
    id: meetupId,
    chatRoomId,
    senderId,
    senderDogId,
    receiverId,
    receiverDogId,
    status: MeetupStatus.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
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
    timestamp: new Date(),
    messageType: MessageType.meetupRequest,
    meetupId: meetupId,
  };

  await addMeetupMessageToChatRoom(chatRoomId, {
    ...message,
    meetupId: message.meetupId as string,
  });
  console.log("✅ Added meet up message to chat room");

  await updateLastMessageInChatRoom(chatRoomId, {
    text: message.text,
    timestamp: message.timestamp,
    senderId,
    messageType: message.messageType,
  });
  console.log("✅ Updated last message in chat room");

  const pushToken = await getPushTokenByUserId(receiverId);
  if (pushToken) {
    await sendPushNotification(pushToken, {
      title: "📨 New Meet-Up Request",
      body: "You have a new meet-up request",
      data: {
        chatRoomId,
        messageType: message.messageType,
      },
    });
  }

  return message;
};

// Update meet-up status: accepted or rejected
export const updateMeetupStatus = async (
  chatRoomId: string,
  meetupId: string,
  status: MeetupStatus,
  senderId: string,
  receiverId: string
): Promise<void> => {
  const text = status === "accepted" ? "✅ Meet-Up Accepted" : "❌ Meet-Up Rejected";

  // update status in meetup collection
  await updateMeetup(meetupId, { status, updatedAt: new Date() });

  console.log(`✅ Updated Meet-Up ${meetupId} status to ${status}`);

  // Find the matching message with this meetupId
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
    const messageDoc = messageSnapshot.docs[0];
    await messageDoc.ref.update({
      text,
      timestamp: new Date(),
    });
  } else {
    console.warn(`⚠️ No matching message found for meetupId ${meetupId}`);
  }

  // await updateMessageInChatRoom(chatRoomId, meetupId, {
  //   text,
  //   timestamp: new Date(),
  // });

  if (!messageSnapshot.empty) {
    const messageDoc = messageSnapshot.docs[0];
    await messageDoc.ref.update({
      text,
      timestamp: new Date(),
      // other fields...
    });
  } else {
    console.warn(`⚠️ No matching message found for meetupId ${meetupId}`);
  }

  await updateLastMessageInChatRoom(chatRoomId, {
    text,
    timestamp: new Date(),
    senderId,
    messageType: MessageType.system,
  });

  if (status === "accepted") {
    const token = await getPushTokenByUserId(receiverId);
    if (token) {
      await sendPushNotification(token, {
        title: "✅ Meet-Up Accepted",
        body: "Your match has accepted the meet-up request!",
        data: { chatRoomId },
      });
    }
  }
};

// Update/reschedule/cancel accepted meet-up
export const cancelMeetupRequest = async (
  chatRoomId: string,
  meetupId: string,
  senderId: string,
  receiverId: string
): Promise<void> => {
  const timestamp = new Date();
  const text = "❌ Meet-Up Cancelled";

  // only cancellation for now
  await updateMeetup(meetupId, { status: MeetupStatus.cancelled, updatedAt: timestamp });

  // 2. Find the original meetup message in the chat
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
    const messageDoc = messageSnapshot.docs[0];
    await messageDoc.ref.update({
      text,
      timestamp,
      status: MeetupStatus.cancelled, // Update status to cancelled
    });
  } else {
    console.warn(`⚠️ No matching message found for meetupId ${meetupId}`);
  }

  console.log(`✅ Updated Meet-Up ${meetupId} status to cancelled`);

  await updateMessageInChatRoom(chatRoomId, meetupId, {
    text: "❌ Meet-Up Cancelled",
    timestamp: new Date(),
    "meetupRequest.status": MeetupStatus.cancelled, // Update status to cancelled
  });

  await updateLastMessageInChatRoom(chatRoomId, {
    text,
    timestamp: new Date(),
    senderId,
    messageType: MessageType.meetupRequest,
  });

  const pushToken = await getPushTokenByUserId(receiverId);
  if (pushToken) {
    await sendPushNotification(pushToken, {
      title: "❌ Meet-Up Cancelled",
      body: "The meet-up has been cancelled.",
      data: { chatRoomId },
    });
  }
};

// Fetch all meetups related to a user
export const fetchUserMeetups = async (userId: string): Promise<MeetupSummaryDTO[]> => {
  const rawMeetups = await getMeetupsForUser(userId);
  const mapped = await Promise.all(rawMeetups.map((m) => toMeetupSummaryDTO(m, userId)));

  console.log(`✅ Fetched ${mapped.length} meetups for user ${userId}`);
  console.log("Fetched user meetups:", mapped);

  return mapped;
};
