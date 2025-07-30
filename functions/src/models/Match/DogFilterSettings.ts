// dog filter settings model
// This file defines the structure for dog filter settings used in matching algorithms and drives the scoring logic

export interface DogFilterSettings {
  maxDistanceInKm: number;
  selectedGender?: string; // "male" | "female" | "any"
  selectedSizes: string[]; // ["small", "medium"]
  selectedPlayStyleTags: string[];
  selectedEnvironmentTags: string[];
  selectedTriggerTags: string[];
  selectedHealthStatus?: string;
  neuteredOnly?: boolean;
  preferredAgeRange?: [number, number]; // [minAge, maxAge]
}
