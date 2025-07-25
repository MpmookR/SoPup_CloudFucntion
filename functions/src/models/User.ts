import { UserGenderOption } from '../models/config';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

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
}
