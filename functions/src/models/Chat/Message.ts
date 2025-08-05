import { MessageType } from "../config";
import { MeetupRequest } from "./MeetupRequest";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderDogId: string;
  receiverDogId: string;
  timestamp: Date;
  messageType: MessageType;
  meetupRequest?: MeetupRequest;
}
