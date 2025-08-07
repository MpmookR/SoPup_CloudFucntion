import { getDogById } from "../repositories/dogRepository";
import { getPushTokenByUserId } from "../repositories/userRepository";
import { sendPushNotification } from "./notificationService";
import { getAcceptedMatchBetween } from "../repositories/matchRequestRepository";
import {
  addMessageToChatRoom,
  updateLastMessageInChatRoom,
  createChatRoomDocument,
  chatRoomExists,
  getMessagesByChatRoomId,
  getChatRoomsByUserId,
  addSystemMessageToChatRoom,
} from "../repositories/chatRepository";

import { Message } from "../models/Chat/Message";
import { MessageType } from "../models/config";
import { ChatRoom } from "../models/Chat/ChatRoom";

// 1. Create a chatroom
export const createChatRoom = async (
  fromUserId: string,
  fromDogId: string,
  toUserId: string,
  toDogId: string
): Promise<string> => {
  const chatRoomId = [fromDogId, toDogId].sort().join("_");

  const exists = await chatRoomExists(chatRoomId);
  if (exists) return chatRoomId;

  const match = await getAcceptedMatchBetween(fromUserId, fromDogId, toDogId);
  if (!match) throw new Error("Match is not accepted");

  const fromDog = await getDogById(fromDogId);
  const toDog = await getDogById(toDogId);
  if (!fromDog || !toDog) throw new Error("One or both dogs not found");

  const isPuppyMode = fromDog.mode === "puppy" || toDog.mode === "puppy";

  const introText = isPuppyMode
    ? "⚠️ Meet-Up is currently disabled.\nOne of the dogs is in Puppy Mode. Puppies under 12 weeks should avoid in-person interactions until fully vaccinated"
    : "✨Matched!\n You can now chat and plan a playdate. Remember: Positive social interactions build confidence and reduce reactivity.";

  await createChatRoomDocument(chatRoomId, {
    id: chatRoomId,
    dogIds: [fromDogId, toDogId],
    userIds: [fromUserId, toUserId],
    createdAt: new Date(),
    isPuppyMode,
    lastMessage: {
      text: introText,
      timestamp: new Date(),
      senderId: "system",
      messageType: MessageType.system,
    },
  });

  console.log(`✅ Chat room created: ${chatRoomId}`);
  console.log(`✅ intro text:`, introText);
  console.log(`✅ Is puppy mode: ${isPuppyMode}`);

  // Add system message to the chatroom
  await addSystemMessageToChatRoom(chatRoomId, {
    text: introText,
    senderId: "system",
    receiverId: toUserId,
    senderDogId: fromDogId,
    receiverDogId: toDogId,
    timestamp: new Date(),
    messageType: MessageType.system,
  });

  // send FCM notification to the other user
  const token = await getPushTokenByUserId(toUserId);
  if (token) {
    await sendPushNotification(token, {
      title: "New Match Chat",
      body: `${fromDog.name} wants to chat with you!`,
    });
  }

  console.log("✅ FCM sent");

  return chatRoomId;
};

// 2. Send a message
export const sendMessage = async (
  chatRoomId: string,
  messageInput: Omit<Message, "id" | "timestamp">
): Promise<Message> => {
  const message: Omit<Message, "id"> = {
    ...messageInput,
    timestamp: new Date(),
    messageType: MessageType.text,
  };

  const messageId = await addMessageToChatRoom(chatRoomId, message);

  const fullMessage: Message = {
    ...message,
    id: messageId,
  };

  await updateLastMessageInChatRoom(chatRoomId, {
    text: message.text,
    timestamp: message.timestamp,
    senderId: message.senderId,
    messageType: message.messageType,
  });

  console.log(`✅ Updated Message sent: ${message.text}`);

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

  return fullMessage;
};


// 3. Fetch all messages
export const getMessagesForChatRoom = async (chatRoomId: string): Promise<Message[]> => {
  console.log(`✅ Fetching all messages for chat room: ${chatRoomId}`);
  return await getMessagesByChatRoomId(chatRoomId);
};

// 4. Fetch all chatrooms
export const getChatRoomsForUser = async (userId: string): Promise<ChatRoom[]> => {
  console.log(`✅ Fetching all chat rooms for user: ${userId}`);
  return await getChatRoomsByUserId(userId);
};
