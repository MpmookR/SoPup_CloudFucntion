import { DogGenderOption } from "../models/Dog";

// Helper to calculate age from date of birth
export function getDogAgeInYears(dob: Date): number {
  return (
    (new Date().getTime() - new Date(dob).getTime()) /
    (1000 * 60 * 60 * 24 * 365)
  );
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
