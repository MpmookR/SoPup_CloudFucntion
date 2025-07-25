import {DogGenderOption, SizeOption, DogMode, DogProfileStatus, DogBehavior, HealthStatus} from "../models/config";


export interface Dog {
  // Core fields
  id: string;
  ownerId: string;
  name: string;
  gender: DogGenderOption;
  size: SizeOption;
  weight: number;
  breed: string;
  dob: Date;
  imageURLs: string[];
  mode: DogMode; // 'puppy' or 'social'
  profileStatus: DogProfileStatus; // 'incomplete' | 'ready'
  bio?: string;
  isMock?: boolean;

  // Puppy-only (mode === 'puppy')
  coreVaccination1Date?: Date;
  coreVaccination2Date?: Date;

  // Social-only (mode === 'social')
  isNeutered?: boolean;
  behavior?: DogBehavior;
  healthStatus?: HealthStatus;
}

