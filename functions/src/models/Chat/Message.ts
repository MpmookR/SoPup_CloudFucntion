import { MessageType } from "../config";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderDogId: string;
  receiverDogId: string;
  timestamp: Date;
  messageType: MessageType;
  meetupId?: string; // Optional for non-meetup messages
}


