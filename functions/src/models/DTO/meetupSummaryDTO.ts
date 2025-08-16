import { MeetupStatus } from "../../models/config";

// use this DTO to summarize meetup requests for the frontend
export interface MeetupSummaryDTO {
  id: string;
  chatRoomId: string;
  proposedTime: string;
  locationName: string;
  status: MeetupStatus;
  otherUserId: string;
  otherUserName: string;
  otherDogId: string;
  otherDogName: string;
  otherDogImageUrl?: string;
  direction: "incoming" | "outgoing";
}
