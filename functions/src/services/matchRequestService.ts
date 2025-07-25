/**
 * Creates a new match request after checking for duplicates.
 *
 * This function checks if a match request from the same user to the same dog already exists.
 * If a duplicate is found, it throws an error. Otherwise, it creates a new match request
 * with a generated ID, current timestamp, and a status of "pending", then saves it to the database.
 *
 * @param data - The match request data, excluding `id` and `createdAt`.
 * @returns The newly created `MatchRequest` object.
 * @throws {Error} If a match request from the same user to the same dog already exists.
 */

import { MatchRequest } from "../models/MatchRequest";
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
const COLLECTION = "matchRequests";


export const createMatchRequest = async (data: Omit<MatchRequest, "id" | "createdAt">): Promise<MatchRequest> => {
  // Check for duplicates
  const existing = await db.collection(COLLECTION)
    .where("fromUserId", "==", data.fromUserId)
    .where("toDogId", "==", data.toDogId)
    .get();

  if (!existing.empty) {
    throw new Error("Match request already exists");
  }

  const request: MatchRequest = {
    ...data,
    id: db.collection(COLLECTION).doc().id,
    createdAt: new Date(),
    status: "pending",
  };

  await db.collection(COLLECTION).doc(request.id).set(request);
  return request;
};

// what is `Omit<MatchRequest, "id" | "createdAt">`?
// It means we are creating a type that has all properties of MatchRequest except for `id` and `createdAt`.
// This is useful when we want to create a new match request without needing to specify those two fields,

