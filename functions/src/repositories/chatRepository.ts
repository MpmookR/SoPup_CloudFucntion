import admin from "../config/firebaseAdmin";
import { Message } from "../models/Chat/Message";
import { ChatRoom, LastMessagePreview } from "../models/Chat/ChatRoom";

const db = admin.firestore();

// 1. Check if chat room exists
export const chatRoomExists = async (chatRoomId: string): Promise<boolean> => {
  const doc = await db.collection("chatRooms").doc(chatRoomId).get();
  return doc.exists;
};

// 2. Create a chat room document
export const createChatRoomDocument = async (chatRoomId: string, data: ChatRoom): Promise<void> => {
  await db.collection("chatRooms").doc(chatRoomId).set(data);
};

// 3. Add a system message (e.g., match confirmation, puppy mode warning)
export const addSystemMessageToChatRoom = async (
  chatRoomId: string,
  message: Omit<Message, "id">
): Promise<string> => {
  const ref = await db.collection("chatRooms").doc(chatRoomId).collection("messages").add(message);

  const messageId = ref.id;

  await ref.update({ id: messageId });

  return messageId;
};

// Add a meet-up message with required meetupId and messageType
export const addMeetupMessageToChatRoom = async (
  chatRoomId: string,
  message: Message
): Promise<void> => {
  await db
    .collection("chatRooms")
    .doc(chatRoomId)
    .collection("messages")
    .doc(message.id) // Use the message ID as the document ID
    .set(message);
};

// 4. Add a user message
export const addMessageToChatRoom = async (
  chatRoomId: string,
  message: Omit<Message, "id"> // don't require `id` beforehand. firebase will generate it
): Promise<string> => {
  const ref = await db.collection("chatRooms").doc(chatRoomId).collection("messages").add(message);

  const messageId = ref.id;

  // Optionally update the document to include the generated ID
  await ref.update({ id: messageId });

  return messageId;
};

// 5. Update a message in the chat room
// use for updating meetup status, rescheduling, etc.
export const updateMessageInChatRoom = async (
  chatRoomId: string,
  messageId: string,
  updates: Partial<FirebaseFirestore.DocumentData> // e.g. usage "meetupRequest.status": "accepted"
): Promise<void> => {
  const messageRef = db
    .collection("chatRooms")
    .doc(chatRoomId)
    .collection("messages")
    .doc(messageId);

  await messageRef.update(updates);
};

// 6. Update the last message field in the chat room
export const updateLastMessageInChatRoom = async (
  chatRoomId: string,
  lastMessage: LastMessagePreview
): Promise<void> => {
  await db.collection("chatRooms").doc(chatRoomId).update({
    lastMessage,
  });
};

// 7. Get all messages for a chat room
export const getMessagesByChatRoomId = async (chatRoomId: string): Promise<Message[]> => {
  const snapshot = await db
    .collection("chatRooms")
    .doc(chatRoomId)
    .collection("messages")
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Message);
};

// 8. Get all chat rooms a user is part of, sorted by latest message
export const getChatRoomsByUserId = async (userId: string): Promise<ChatRoom[]> => {
  const snapshot = await db
    .collection("chatRooms")
    .where("userIds", "array-contains", userId)
    .orderBy("lastMessage.timestamp", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as ChatRoom;
    data.id = doc.id;
    return data;
  });
};

