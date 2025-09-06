import { matchScoringDTO } from "../models/DTO/matchScoringDTO";
import { ScoredDog } from "../models/Dog";
import { getDogsByIds, getDogCoordinatesByIds } from "../repositories/dogRepository";
import { getDistance } from "../helper/geoHelper";
import {
  getGenderNeuterCompatibilityScore,
  getPreferredAgeScore,
  passesHardFilters,
} from "../helper/matchHelper";
import { normalizeDob } from "../helper/dateUtils";
import { getExcludedDogIdsForDog } from "./matchExclusionService";

// This function scores and sorts dog matches based on the provided MatchScoringDTO.
// It takes in a MatchScoringDTO object containing the current dog ID
// filtered dog IDs, user location, and optional filters.
// It returns a sorted array of ScoredDog objects with their scores.
export const scoreAndSortMatches = async (input: matchScoringDTO): Promise<ScoredDog[]> => {
  const { filteredDogIds, userLocation, filters } = input;
  const DISTANCE_WEIGHT = 5; // Weight for distance scoring
  const maxDistance = filters?.maxDistanceInKm ?? 60;

  // Log the received filters for debugging
  console.log("🔍 Received Filters:", JSON.stringify(filters, null, 2));

  // --- server-side exclusions ---
  const serverExcluded = input.currentDogId?.id ?
    await getExcludedDogIdsForDog(input.currentDogId.id) :
    new Set<string>();
  const clientExcluded = new Set(input.excludedDogIds ?? []);
  const excludedAll = new Set([...serverExcluded, ...clientExcluded]);

  console.log("🚫 Server excluded dog IDs:", Array.from(serverExcluded));
  console.log("🚫 Client excluded dog IDs:", Array.from(clientExcluded));
  console.log("🚫 Total excluded dog IDs:", Array.from(excludedAll));
  console.log("✅ Original filtered dog IDs:", filteredDogIds.length);

  // Remove excluded ids up front
  const candidateIds = filteredDogIds.filter((id) => !excludedAll.has(id));
  console.log(`📊 After exclusions: ${candidateIds.length} dogs remaining`);

  if (candidateIds.length === 0) return [];

  // Step 1: Fetch remaining candidates (after exclusions)
  const candidates = await getDogsByIds(candidateIds);

  // Step 2: Hard filters (gender/age/etc.)
  const filteredCandidates = candidates.filter((candidate) =>
    passesHardFilters(candidate, filters)
  );

  // Step 3: Fetch coordinates for the remaining candidate set
  const coordinateMap = await getDogCoordinatesByIds(filteredCandidates.map((c) => c.id));

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
  // exclude 0 score user
  // return scored.filter(dog => dog.score > 0).sort((a, b) => b.score - a.score);

  // include 0 score user
  return scored.filter((dog) => dog.score >= 0).sort((a, b) => b.score - a.score);
};
