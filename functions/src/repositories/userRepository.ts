import { User } from "../models/User";
import admin from "../config/firebaseAdmin";

const db = admin.firestore();
const usersCollection = db.collection("users");

// Fetch a user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const doc = await usersCollection.doc(userId).get();
  return doc.exists ? (doc.data() as User) : null;
};

// Gets the full User document by Dog ID (via primaryDogId).
export const getUserByDogId = async (dogId: string): Promise<User | null> => {
  const snapshot = await usersCollection
    .where("primaryDogId", "==", dogId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as User;
};

// Fetches the push token for a user by their ID
// This is used for sending FCM notifications
export const getPushTokenByUserId = async (userId: string): Promise<string | null> => {
  const doc = await usersCollection.doc(userId).get();
  if (!doc.exists) return null;

  const user = doc.data() as User;
  return user.pushToken ?? null;
};

// to write review stats to the user document
export const updateUserReviewStats = async (
  userId: string,
  stats: { averageRating: number; reviewCount: number }
): Promise<void> => {
  await usersCollection.doc(userId).update(stats);
};

// Fetches the review stats for a user
export const getUserReviewStats = async (
  userId: string
): Promise<{ averageRating: number; reviewCount: number } | null> => {
  const doc = await usersCollection.doc(userId).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    averageRating: data?.averageRating ?? 0,
    reviewCount: data?.reviewCount ?? 0,
  };
};

