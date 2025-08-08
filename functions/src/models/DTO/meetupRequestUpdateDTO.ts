import { Coordinate } from "../Coordinate";
import { MeetupStatus } from "../../models/config";

// DTO for updating a meetup request
export interface MeetupRequestUpdateDTO {
  id: string;
  proposedTime?: Date;
  locationName?: string;
  locationCoordinate?: Coordinate;
  meetUpMessage?: string;
  status: MeetupStatus;
  updatedAt: Date;
}
