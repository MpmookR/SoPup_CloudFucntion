import admin from "../config/firebaseAdmin";
import { MatchRequest } from "../models/Match/MatchRequest";

const COLLECTION = "matchRequests";

export const getExcludedDogIdsForDog = async (dogId: string): Promise<Set<string>> => {
  const db = admin.firestore();

  console.log(`🔍 Fetching exclusions for dog: ${dogId}`);

  // Pending/accepted where current dog SENT the request
  const fromSnap = await db
    .collection(COLLECTION)
    .where("fromDogId", "==", dogId)
    .where("status", "in", ["pending", "accepted"])
    .get();

  // Pending/accepted where current dog RECEIVED the request
  const toSnap = await db
    .collection(COLLECTION)
    .where("toDogId", "==", dogId)
    .where("status", "in", ["pending", "accepted"])
    .get();

  const result = new Set<string>();
  fromSnap.docs.forEach((d) => result.add((d.data() as MatchRequest).toDogId));
  toSnap.docs.forEach((d) => result.add((d.data() as MatchRequest).fromDogId));

  console.log(`🚫 Excluded dog IDs for ${dogId}:`, Array.from(result));
  console.log(
    `💡 Found ${fromSnap.docs.length} outgoing requests and ${toSnap.docs.length} incoming requests`
  );

  return result;
};
