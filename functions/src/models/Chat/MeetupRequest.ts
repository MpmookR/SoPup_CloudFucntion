import { Coordinate } from "../Coordinate";
import { MeetupStatus } from "../../models/config";

// this model is for firestore documents
export interface MeetupRequest {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderDogId: string;
  receiverId: string;
  receiverDogId: string;
  proposedTime: Date;
  locationName: string;
  locationCoordinate: Coordinate;
  meetUpMessage: string;
  status: MeetupStatus;
  createdAt: Date;
  updatedAt: Date;
}
