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

// map of dog IDs to user coordinates
// This allows quickly access user coordinates based on their primary dog ID
// without mapping we would have to fetch each user individually and costs more reads
// export const getUserCoordinatesByDogIds = async ( dogIds: string[]): Promise<Map<string, Coordinate>> => {
//   const snapshot = await db.collection("users")
//     .where("primaryDogId", "in", dogIds)
//     .get();

//   const map = new Map<string, Coordinate>();

//   snapshot.forEach(doc => {
//     const user = doc.data() as User;
//     if (user.primaryDogId && user.coordinate) {
//       map.set(user.primaryDogId, user.coordinate);
//     }
//   });

//   return map;
// };
