import { Coordinate } from "../Coordinate";
import { MeetupStatus } from "../../models/config";

export interface MeetupRequest {
  proposedTime: Date;
  locationName: string;
  locationCoordinate: Coordinate;
  meetUpMessage: string;
  status: MeetupStatus;
}