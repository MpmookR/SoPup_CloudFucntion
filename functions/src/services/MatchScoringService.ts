import { MatchScoringDTO } from "../models/Match/MatchScoringDTO";
import { ScoredDog } from "../models/Dog";
import { getDogsByIds } from "../repositories/dogRepository";
import { getUserCoordinatesByDogIds } from "../repositories/userRepository";
import { getDistance } from "../helper/geoHelper";

/**
 * Scores and sorts dog matches based on the provided MatchScoringDTO.
 * 
 * @param input - The MatchScoringDTO containing current dog ID, filtered dog IDs, user location, and optional filters.
 * @returns A sorted array of ScoredDog objects with their scores.
 */

export const scoreAndSortMatches = async (
  input: MatchScoringDTO
): Promise<ScoredDog[]> => {
  const { filteredDogIds, userLocation, filters } = input;

  // Step 1: Fetch current dog and candidate dogs
  const candidates = await getDogsByIds(filteredDogIds);

  // Step 2: Batch fetch user coordinates for all candidate dogs
  const coordinateMap = await getUserCoordinatesByDogIds(filteredDogIds);

  const scored: ScoredDog[] = candidates.map((candidate) => {
    let score = 0;

    // Apply filter-based scoring
    if (filters) {
      if (filters.selectedGender && candidate.gender === filters.selectedGender)score += 10;
      if (filters.neuteredOnly && candidate.isNeutered) score += 10;
      if (filters.selectedSizes?.includes(candidate.size)) score += 5;
      if (filters.selectedPlayStyleTags?.some((tag) => candidate.behavior?.playStyles?.includes(tag))) score += 5;
      if (filters.selectedEnvironmentTags?.some((tag) => candidate.behavior?.preferredPlayEnvironments?.includes(tag))) score += 5;
      if (filters.selectedTriggerTags?.some((tag) => candidate.behavior?.triggersAndSensitivities?.includes(tag))) score += 5;
      if (filters.selectedHealthStatus && candidate.healthStatus === filters.selectedHealthStatus) score += 5;
      if (filters.selectedHealthStatus && candidate.healthStatus === filters.selectedHealthStatus) score += 5;
    }

    // Add location scoring
    const DISTANCE_WEIGHT = 5; // Weight for distance scoring
    let locationScore = 0; //

    if (userLocation) {
      const candidateCoordinate = coordinateMap.get(candidate.id);
      if (candidateCoordinate) {
        const distance = getDistance(userLocation, candidateCoordinate);
        const maxDistance = filters?.maxDistanceInKm ?? 60;
        if (distance <= maxDistance) {
          locationScore = Math.max(0, (maxDistance - distance) * DISTANCE_WEIGHT);
        }
      }
    }

    //example: if maxDistance is 60km and distance is 30km, score will be 150
    // (maxDistance - distance) * DISTANCE_WEIGHT >>  (60 - 30) * 5 = 150
    // if maxDistance is 60km and distance is 60km, score will be 0

    return { dog: candidate, score: score + locationScore };
  });

  // Step 3: sorts the array of ScoredDog objects in descending order of their score
  return scored.sort((a, b) => b.score - a.score);
};
