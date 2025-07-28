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
