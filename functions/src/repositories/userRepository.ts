import { User } from "../models/User";
import { firestore } from "../config/firebaseAdmin";

const COLLECTION = "users";

// Gets the full User document by Dog ID (via primaryDogId).
export const getUserByDogId = async (dogId: string): Promise<User | null> => {
  const snapshot = await firestore
    .collection(COLLECTION)
    .where("primaryDogId", "==", dogId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as User;
};

export const getPushTokenByUserId = async (userId: string): Promise<string | null> => {
  const doc = await firestore.collection("users").doc(userId).get();
  if (!doc.exists) return null;

  const user = doc.data() as User;
  return user.pushToken ?? null;
};
