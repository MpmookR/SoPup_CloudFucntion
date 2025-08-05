import admin from "../config/firebaseAdmin";
import { getDogById } from "../repositories/dogRepository";
import { getPushTokenByUserId } from "../repositories/userRepository";
import { sendPushNotification } from "./notificationService";
import { getAcceptedMatchBetween } from "../repositories/matchRequestRepository";
import { Message } from "../models/Chat/Message";
import { MessageType } from "../models/config";

const db = admin.firestore();
// 1. Create a chatroom
export const createChatRoom = async (
  fromUserId: string,
  fromDogId: string,
  toUserId: string,
  toDogId: string
): Promise<string> => {
  const chatRoomId = [fromDogId, toDogId].sort().join("_");
  const chatRoomRef = db.collection("chatRooms").doc(chatRoomId);

  const existing = await chatRoomRef.get();
  if (existing.exists) {
    return chatRoomId;
  }

  // 1. Verify match is accepted
  const match = await getAcceptedMatchBetween(fromUserId, fromDogId, toDogId);
  if (!match) {
    throw new Error("Match is not accepted");
  }

  // 2. Get both dogs
  const fromDog = await getDogById(fromDogId);
  const toDog = await getDogById(toDogId);

  if (!fromDog || !toDog) {
    throw new Error("One or both dogs not found");
  }

  const isPuppyMode = fromDog.mode === "puppy" || toDog.mode === "puppy";

  // 3. Create the chat room
  await chatRoomRef.set({
    id: chatRoomId,
    dogIds: [fromDogId, toDogId],
    userIds: [fromUserId, toUserId],
    createdAt: new Date(),
    isPuppyMode,
  });

  // 4. If Puppy Mode – send system message
  const systemMessageId = db.collection("chatRooms").doc().id;

  const systemMessage = {
    id: systemMessageId,
    text: isPuppyMode
      ? "Please be informed that Meet-Up is disabled because your match is currently in Puppy Mode.\nPuppies under 12 weeks should avoid in-person interactions until fully vaccinated. You’ll be able to schedule meet-ups once both dogs are in Social Mode."
      : "✨Matched!\n You can now chat and plan a playdate. Remember: Positive social interactions build confidence and reduce reactivity.",
    senderId: "system",
    receiverId: toUserId,
    senderDogId: fromDogId,
    receiverDogId: toDogId,
    timestamp: new Date(),
    messageType: "system",
  };

  await chatRoomRef.collection("messages").doc(systemMessageId).set(systemMessage);

  console.log("✅ Chat room created:", chatRoomId);

  // 5. Send push notification
  const token = await getPushTokenByUserId(toUserId);
  if (token) {
    await sendPushNotification(token, {
      title: "New Match Chat",
      body: `${fromDog.name} wants to chat with you!`,
    });
  }
  console.log("✅ Push notification sent to", toUserId);

  return chatRoomId;
};

export const sendMessage = async (
  chatRoomId: string,
  messageInput: Omit<Message, "id" | "timestamp">
): Promise<Message> => {
  const messageId = db.collection("chatRooms").doc().id;

  const message: Message = {
    ...messageInput,
    id: messageId,
    timestamp: new Date(), // or use FieldValue.serverTimestamp()
    messageType: MessageType.text,
  };

  const messageRef = db
    .collection("chatRooms")
    .doc(chatRoomId)
    .collection("messages")
    .doc(messageId);

  await messageRef.set(message);

  console.log("✅ Message sent:", message);

  const senderDog = await getDogById(message.senderDogId);
  const senderName = senderDog ? senderDog.name : "Your match";

  const pushToken = await getPushTokenByUserId(message.receiverId);

  if (pushToken) {
    await sendPushNotification(pushToken, {
      title: "New Message from " + senderName,
      body: message.text,
      data: {
        chatRoomId,
        senderDogId: message.senderDogId,
        senderId: message.senderId,
        messageType: message.messageType,
      },
    });
  }

  console.log("✅ Push notification sent to", message.receiverId);

  return message;
};

// 1. Create a chatroom -done
// 2. send a message in a chatroom
// 3. Fetch all Messages

// 4. send meet-up request > forward to chatroom
// 5. update meet-up request status - reject/accept > forward to chatroom
// 6. update accepted meet-up details(date + cancel): > forward to chatroom
