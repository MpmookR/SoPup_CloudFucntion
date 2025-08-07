import { UserGenderOption } from "./config";
import { Coordinate } from "./Coordinate";

export interface User {
  id: string;
  name: string;
  gender: UserGenderOption;
  imageURL: string;
  location: string;
  coordinate: Coordinate;
  locationPermissionDenied?: boolean;
  bio?: string;
  language: string;
  primaryDogId: string;
  isMock?: boolean;
  pushToken?: string; // FCM token

  averageRating: number;   
  reviewCount: number;     
}
