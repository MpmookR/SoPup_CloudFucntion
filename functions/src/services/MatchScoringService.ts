import { MatchScoringDTO } from "../models/Match/MatchScoringDTO";
import { ScoredDog } from "../models/Dog";
import { getDogsByIds } from "../repositories/dogRepository";
import { getDogCoordinatesByIds } from "../repositories/dogRepository";
import { getDistance } from "../helper/geoHelper";
import { getPreferredAgeScore, getGenderNeuterCompatibilityScore } from "../helper/matchHelper";

/**
 * Scores and sorts dog matches based on the provided MatchScoringDTO.
 * 
 * @param input - The MatchScoringDTO containing current dog ID, filtered dog IDs, user location, and optional filters.
 * @returns A sorted array of ScoredDog objects with their scores.
 */

export const scoreAndSortMatches = async ( input: MatchScoringDTO ): Promise<ScoredDog[]> => {

  const { filteredDogIds, userLocation, filters } = input;
  
  const DISTANCE_WEIGHT = 10; // Weight for distance scoring
  const maxDistance = filters?.maxDistanceInKm ?? 60;

  // Step 1: Fetch current dog and candidate dogs
  const candidates = await getDogsByIds(filteredDogIds);

  // Step 2: Batch fetch user coordinates for all candidate dogs
  const coordinateMap = await getDogCoordinatesByIds(filteredDogIds);

  const scored: ScoredDog[] = candidates.map((candidate) => {
    let filterScore = 0;

    // Apply filter-based scoring
   if (filters) {
  
  // 1. Compatibility logic
  // if intact only is selected and candidate is not neutered
  filterScore += getGenderNeuterCompatibilityScore(
    input.currentDogId?.gender,
    input.currentDogId?.isNeutered,
    candidate.gender,
    candidate.isNeutered
  );
  
  // 2. Direct filters
  if (filters.selectedGender && candidate.gender === filters.selectedGender) filterScore += 5;
  if (filters.neuteredOnly && candidate.isNeutered) filterScore += 10;
  if (filters.selectedSizes?.includes(candidate.size)) filterScore += 3;
  if (filters.selectedPlayStyleTags?.some(tag => candidate.behavior?.playStyles?.includes(tag))) filterScore += 5;
  if (filters.selectedEnvironmentTags?.some(tag => candidate.behavior?.preferredPlayEnvironments?.includes(tag))) filterScore += 3;
  if (filters.selectedHealthStatus && candidate.healthStatus === filters.selectedHealthStatus) filterScore += 1;

  // 3. Risk mitigation
  // Penalise for having any filtered trigger
  if (filters.selectedTriggerTags?.some(tag => candidate.behavior?.triggersAndSensitivities?.includes(tag))) {filterScore -= 5; }

  // 4. Age filter (hard preference)
  // If preferred age is matched, score 3 points
  if (filters.preferredAgeRange) {
    filterScore += getPreferredAgeScore(candidate.dob, filters.preferredAgeRange);
  }

  }
    // Add location scoring
    let locationScore = 0; //
    if (userLocation) {
      const candidateCoordinate = coordinateMap.get(candidate.id);
      if (candidateCoordinate) {
        const distance = getDistance(userLocation, candidateCoordinate);
        if (distance <= maxDistance) {
          locationScore = Math.max(0, (maxDistance - distance) * DISTANCE_WEIGHT);
        }
      }
    }

    //example: if maxDistance is 60km and distance is 30km, score will be 150
    // (maxDistance - distance) * DISTANCE_WEIGHT >>  (60 - 30) * 5 = 150
    // if maxDistance is 60km and distance is 60km, score will be 0

    return { 
      dog: candidate, 
      score: filterScore + locationScore 
    };
  });

  // Step 3: sorts the array of ScoredDog objects in descending order of their score
  return scored.sort((a, b) => b.score - a.score);
};
