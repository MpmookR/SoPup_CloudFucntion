import { MessageType } from "../config";

export interface LastMessagePreview {
  text: string;
  timestamp: Date;
  senderId: string;
  messageType: MessageType;
}

export interface ChatRoom {
  id: string;
  dogIds: string[]; // e.g., ["dog123", "dog456"]
  userIds: string[]; // e.g., ["user123", "user456"]
  createdAt: Date;
  isPuppyMode: boolean;
  lastMessage: LastMessagePreview; // stores the last message preview like WhatsApp or Telegram
}
