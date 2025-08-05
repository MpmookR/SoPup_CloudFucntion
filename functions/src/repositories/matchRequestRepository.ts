import admin from "../config/firebaseAdmin";
import { MatchRequest } from "../models/Match/MatchRequest";

const db = admin.firestore();
const COLLECTION = "matchRequests";
// to check if a match request exists between two dogs
// for the chat creation process
export const getAcceptedMatchBetween = async (
  fromUserId: string,
  fromDogId: string,
  toDogId: string
): Promise<MatchRequest | null> => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("fromUserId", "==", fromUserId)
    .where("fromDogId", "==", fromDogId)
    .where("toDogId", "==", toDogId)
    .where("status", "==", "accepted")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as MatchRequest;
};
