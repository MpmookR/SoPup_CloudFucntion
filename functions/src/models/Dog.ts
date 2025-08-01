import {
  DogGenderOption,
  SizeOption,
  DogMode,
  DogProfileStatus,
  DogBehavior,
  HealthStatus,
} from "./config";
import { Coordinate } from "./Coordinate";

export interface Dog {
  // Core fields
  id: string;
  ownerId: string;
  name: string;
  gender: DogGenderOption;
  size: SizeOption;
  weight: number;
  breed: string;
  dob: Date | string; // Date or ISO string
  imageURLs: string[];
  mode: DogMode; // 'puppy' or 'social'
  profileStatus: DogProfileStatus; // 'incomplete' | 'ready'
  bio?: string;
  isMock?: boolean;

  coordinate: Coordinate;

  // Puppy-only (mode === 'puppy')
  coreVaccination1Date?: Date | string;
  coreVaccination2Date?: Date | string;

  // Social-only (mode === 'social')
  isNeutered?: boolean;
  behavior?: DogBehavior;
  healthStatus?: HealthStatus;
}

export interface ScoredDog {
  dog: Dog;
  score: number;
}

export { DogGenderOption };
