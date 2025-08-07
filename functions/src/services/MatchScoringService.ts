import { matchScoringDTO } from "../models/DTO/matchScoringDTO";
import { ScoredDog } from "../models/Dog";
import { getDogsByIds, getDogCoordinatesByIds } from "../repositories/dogRepository";
import { getDistance } from "../helper/geoHelper";
import { getGenderNeuterCompatibilityScore, getPreferredAgeScore, passesHardFilters } from "../helper/matchHelper";
import { normalizeDob } from "../helper/convertDatesToISO";

/**
 * Scores and sorts dog matches based on the provided MatchScoringDTO.
 *
 * @param input - The MatchScoringDTO containing current dog ID, filtered dog IDs, user location, and optional filters.
 * @returns A sorted array of ScoredDog objects with their scores.
 */

export const scoreAndSortMatches = async (input: matchScoringDTO): Promise<ScoredDog[]> => {
  const { filteredDogIds, userLocation, filters } = input;

  const DISTANCE_WEIGHT = 5; // Weight for distance scoring
  const maxDistance = filters?.maxDistanceInKm ?? 60;

  // Log the received filters for debugging
  console.log("🔍 Received Filters:", JSON.stringify(filters, null, 2));

  // Step 1: Fetch current dog and candidate dogs
  const candidates = await getDogsByIds(filteredDogIds);

  // Step 2: Apply hard filters before scoring
  const filteredCandidates = candidates.filter((candidate) =>
    passesHardFilters(candidate, filters)
  );

  // Step 3: Batch fetch user coordinates for all candidate dogs
  const coordinateMap = await getDogCoordinatesByIds(filteredDogIds);

  // step 4: score and sort
  const scored: ScoredDog[] = filteredCandidates.map((candidate) => {
    let filterScore = 0;

    // Apply filter-based scoring
    if (filters) {
      // 1. Compatibility logic
      filterScore += getGenderNeuterCompatibilityScore(
        input.currentDogId?.gender,
        input.currentDogId?.isNeutered,
        candidate.gender,
        candidate.isNeutered
      );

      // 2. Direct filters
      // Check if candidate matches the filters
      if (filters.selectedGender && candidate.gender === filters.selectedGender) {
        filterScore += 5;
      }
      if (filters.neuteredOnly && candidate.isNeutered) {
        filterScore += 10;
      }
      if (filters.selectedSizes?.includes(candidate.size)) {
        filterScore += 3;
      }
      if (
        filters.selectedPlayStyleTags?.some((tag) => candidate.behavior?.playStyles?.includes(tag))
      ) {
        filterScore += 5;
      }
      if (
        filters.selectedEnvironmentTags?.some((tag) =>
          candidate.behavior?.preferredPlayEnvironments?.includes(tag)
        )
      ) {
        filterScore += 3;
      }
      if (filters.selectedHealthStatus && candidate.healthStatus === filters.selectedHealthStatus) {
        filterScore += 1;
      }

      // 3. Risk mitigation
      // Penalise for having any filtered trigger
      console.log(`🐾 ${candidate.name}'s triggers:`, candidate.behavior?.triggersAndSensitivities);

      if (
        // the value is an array and the filter is also an array
        // using Array.isArray to ensure we don't get errors if they are not arrays
        Array.isArray(candidate.behavior?.triggersAndSensitivities) &&
        Array.isArray(filters.selectedTriggerTags)
      ) {
        const matchedTriggers = filters.selectedTriggerTags.filter((tag) =>
          candidate.behavior!.triggersAndSensitivities!.includes(tag)
        );

        if (matchedTriggers.length > 0) {
          const penalty = matchedTriggers.length * 5;
          console.log(
            `🚨 Trigger match for ${candidate.name}: [${matchedTriggers.join(", ")}], applying penalty of -${penalty}`
          );
          filterScore -= penalty;
        }
      }

      // 4. Age filter (hard preference)
      // If preferred age is matched, score 3 points
      if (filters.preferredAgeRange) {
        // use normalizeDob to handle different date formats
        // and ensure dob is a Date object
        const normalizedDob = normalizeDob(candidate.dob);
        filterScore += getPreferredAgeScore(normalizedDob, filters.preferredAgeRange);
      }
    }
    // Add location scoring
    let locationScore = 0;
    if (userLocation) {
      const candidateCoordinate = coordinateMap.get(candidate.id);
      if (candidateCoordinate) {
        const distance = getDistance(userLocation, candidateCoordinate);
        if (distance <= maxDistance) {
          locationScore = Math.max(0, (maxDistance - distance) * DISTANCE_WEIGHT);
        }
      }
    }
    // example: if maxDistance is 60km and distance is 30km, score will be 150
    // (maxDistance - distance) * DISTANCE_WEIGHT >>  (60 - 30) * 5 = 150
    // if maxDistance is 60km and distance is 60km, score will be 0

    const totalScore = filterScore + locationScore;
    console.log(
      `🐶 Scoring dog ${candidate.name}, Filter Score = ${filterScore}, Location Score = ${locationScore}`
    );
    console.log(`⭐️ Total Score for ${candidate.name}: ${totalScore}`);

    return {
      dog: candidate,
      score: totalScore,
    };
  });

  // Step 3: sorts the array of ScoredDog objects in descending order of their score
  return scored.filter((dog) => dog.score > 0).sort((a, b) => b.score - a.score);
};
