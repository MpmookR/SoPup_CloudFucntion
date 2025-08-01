import admin from "../config/firebaseAdmin";
import { User } from "../models/User";

const db = admin.firestore();
const COLLECTION = "users";

// Gets the full User document by Dog ID (via primaryDogId).

export const getUserByDogId = async (dogId: string): Promise<User | null> => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("primaryDogId", "==", dogId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as User;
};
