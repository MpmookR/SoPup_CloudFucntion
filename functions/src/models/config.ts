// Enums

export enum UserGenderOption {
  Female = "female",
  Male = "male",
  Other = "other",
  PreferNotToSay = "prefer not to say",
}

// String Arrays for Selectable Options
export const languageOptions: string[] = [
  // Western Europe
  "English", "French", "Spanish", "Italian", "German", "Dutch", "Portuguese",
  "Greek", "Swedish", "Finnish", "Norwegian", "Danish",

  // Eastern Europe
  "Polish", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian",
  "Ukrainian", "Russian", "Serbian", "Croatian", "Slovenian",
  "Lithuanian", "Latvian", "Estonian",

  // Asia
  "Chinese", "Japanese", "Korean", "Hindi", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Filipino", "Bengali", "Tamil", "Urdu",
  "Turkish", "Farsi",
];

// Enums for Dog Profile Options

export enum DogMode {
  Puppy = "puppy",
  Social = "social",
}

export enum DogGenderOption {
  Male = "male",
  Female = "female",
}

export enum SizeOption {
  ExtraSmall = "Extra Small",
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
  ExtraLarge = "Extra Large",
}

export enum DogProfileStatus {
  Incomplete = "incomplete",
  Ready = "ready",
}

export enum HealthVerificationStatus {
  Verified = "verified",
  Unverified = "unverified",
}

export const playStyleOptions: string[] = [
  "Chaser", "Wrestler", "Tugger", "Mouthy", "Gentle Player", "Independent",
  "Ball-focused", "Social Butterfly", "Selective Player",
  "Overexcited", "Explorer", "Observer",
];

export const playEnvironmentOptions: string[] = [
  "Open Fields", "Enclosed Parks", "Home Garden",
  "Daycare", "Indoor", "Flexible",
];

export const triggerSensitivityOptions: string[] = [
  "Loud noises", "Sudden movements", "Cats", "Vehicle",
  "Wheelchairs", "Vacuum cleaners", "Strangers",
];

export interface DogBehavior {
  playStyles: string[];
  preferredPlayEnvironments: string[];
  triggersAndSensitivities: string[];
  customPlayStyle?: string;
  customPlayEnvironment?: string;
  customTriggerSensitivity?: string;
}

export interface HealthStatus {
  fleaTreatmentDate?: Date;
  wormingTreatmentDate?: Date;
}

// for the message type in chat
export enum MessageType {
  text = "text", // plain text message
  meetupRequest = "meetupRequest", // message containing a meetup request
  system = "system" // system-generated messages (e.g., match confirmation, puppy mode warning)
}

export enum MeetupStatus {
  pending = "pending", 
  upcoming = "accepted",
  declined = "rejected",
  completed = "completed",
  cancelled = "cancelled",
}