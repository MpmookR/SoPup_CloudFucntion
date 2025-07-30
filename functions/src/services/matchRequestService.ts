import { MatchRequest } from "../models/Match/MatchRequest";
import { firestore } from "../config/firebaseAdmin";

const COLLECTION = "matchRequests";

// what is `Omit<MatchRequest, "id" | "createdAt">`?
// It means we are creating a type that has all properties of MatchRequest except for `id` and `createdAt`.
// This is useful when we want to create a new match request without needing to specify those two fields.
export const createMatchRequest = async (
  data: Omit<MatchRequest, "id" | "createdAt">
): Promise<MatchRequest> => {
  // Check for duplicates
  const existing = await firestore
    .collection(COLLECTION)
    .where("fromUserId", "==", data.fromUserId)
    .where("toDogId", "==", data.toDogId)
    .get();

  if (!existing.empty) {
    throw new Error("Match request already exists");
  }

  const request: MatchRequest = {
    ...data,
    id: firestore.collection(COLLECTION).doc().id,
    createdAt: new Date(),
    status: "pending",
  };

  await firestore.collection(COLLECTION).doc(request.id).set(request);
  return request;
};

export const getAllMatchRequests = async (): Promise<MatchRequest[]> => {
  const snapshot = await firestore.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => doc.data() as MatchRequest);
};

// define the type for match request status
export type matchRequestType = "incoming" | "outgoing" | "accepted";

// This function retrieves match requests based on the type
export const getMatchRequests = async (
  dogId: string,
  type: matchRequestType
): Promise<MatchRequest[]> => {
  const collection = firestore.collection(COLLECTION);

  switch (type) {
  // using the dogId to filter match requests in the case of more than one dog being owned by a user
  case "incoming": {
    // incoming: current dog is the recipient
    const snapshot = await collection
      .where("toDogId", "==", dogId)
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map((doc) => doc.data() as MatchRequest);
  }

  case "outgoing": {
    // outgoing: current dog is the sender
    const snapshot = await collection
      .where("fromDogId", "==", dogId)
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map((doc) => doc.data() as MatchRequest);
  }

  case "accepted": {
    // Fetches match requests where the dog sent the request and it was accepted.
    const fromSnap = await collection
      .where("fromDogId", "==", dogId)
      .where("status", "==", "accepted")
      .get();

    // Fetches match requests where the dog received the request and it was accepted.
    const toSnap = await collection
      .where("toDogId", "==", dogId)
      .where("status", "==", "accepted")
      .get();

    const fromMatches = fromSnap.docs.map((doc) => doc.data() as MatchRequest);
    const toMatches = toSnap.docs.map((doc) => doc.data() as MatchRequest);

    // Combine both arrays to get all accepted match requests for the dog
    return [...fromMatches, ...toMatches];
  }

  default:
    throw new Error("Invalid match request type");
  }
};

// This function updates the status of a match request
export const updateMatchRequestStatus = async (
  requestId: string,
  newStatus: "accepted" | "rejected"
): Promise<void> => {
  const docRef = firestore.collection(COLLECTION).doc(requestId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Match request not found");
  }

  await docRef.update({ status: newStatus });
};
