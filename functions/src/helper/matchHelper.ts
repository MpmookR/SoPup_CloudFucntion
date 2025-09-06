import { DogGenderOption, Dog } from "../models/Dog";
import { DogFilterSettings } from "../models/Match/DogFilterSettings";
import { normalizeDob } from "./dateUtils";

// Helper to calculate age from date of birth
export function getDogAgeInYears(dob: Date): number {
  return (new Date().getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365);
}

// Helper to score based on preferred age range filter
export function getPreferredAgeScore(
  candidateDob?: Date,
  preferredAgeRange?: [number, number]
): number {
  if (!candidateDob || !preferredAgeRange) return 0;

  const candidateAge = getDogAgeInYears(candidateDob);
  const [min, max] = preferredAgeRange;

  return candidateAge >= min && candidateAge <= max ? 3 : 0; // Score of 3 if within preferred age range
}

// Calculates gender and neuter compatibility score between two dogs.
export function getGenderNeuterCompatibilityScore(
  currentGender?: DogGenderOption,
  currentIsNeutered?: boolean,
  candidateGender?: DogGenderOption,
  candidateIsNeutered?: boolean
): number {
  if (!currentGender || !candidateGender) return 0;

  const sameGender = currentGender === candidateGender;
  const oneOrBothNeutered = currentIsNeutered || candidateIsNeutered;
  const bothNeutered = currentIsNeutered && candidateIsNeutered;

  if (!sameGender && oneOrBothNeutered) return 10; // Opposite gender & at least one neutered
  if (sameGender && bothNeutered) return 5; // Same gender & both neutered
  return 0; // Same gender & at least one intact
}

// Checks if a dog passes all exclude filters
// This is used to filter out dogs that do not meet the hard requirements before scoring them
export function passesHardFilters(candidate: Dog, filters?: DogFilterSettings): boolean {
  // No filters means all candidates pass
  if (!filters) return true;

  if (filters.selectedGender && candidate.gender !== filters.selectedGender) {
    return false;
  }

  if (filters.neuteredOnly && !candidate.isNeutered) {
    return false;
  }

  if (filters.selectedSizes?.length && !filters.selectedSizes.includes(candidate.size)) {
    return false;
  }

  // check age filter
  if (filters.preferredAgeRange) {
    const ageScore = getPreferredAgeScore(normalizeDob(candidate.dob), filters.preferredAgeRange);
    // If age score is 0, it means the dog does not meet the preferred age range
    // so we return false to exclude this dog from scoring
    if (ageScore <= 0) return false;
  }

  return true;
}
