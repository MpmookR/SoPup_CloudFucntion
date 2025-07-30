import admin from "../config/firebaseAdmin";
import { Dog } from "../models/Dog";
import { Coordinate } from "../models/Coordinate";

const db = admin.firestore();
const dogsCollection = db.collection("dogs");

// Fetch a single dog by ID for current dog profile
export const getDogById = async (dogId: string): Promise<Dog | null> => {
  const doc = await dogsCollection.doc(dogId).get();
  return doc.exists ? (doc.data() as Dog) : null;
};

// Fetch multiple dogs by their IDs for match scoring
export const getDogsByIds = async (dogIds: string[]): Promise<Dog[]> => {
  const snapshots = await Promise.all(
    dogIds.map((id) => dogsCollection.doc(id).get())
  );

  return snapshots.flatMap((doc, i) => {
    if (!doc.exists) {
      console.warn(`Dog not found: ${dogIds[i]}`);
      return [];
    }
    return [doc.data() as Dog];
  });
};

// flatMap() is used to flatten the array of arrays into a single array
// This allows us to handle cases where some dogs might not exist without breaking the overall flow
// If a dog does not exist, we log a warning and skip it

// Fetch user coordinates for multiple dogs
// This allows us to quickly access user coordinates based on their primary dog ID
export const getDogCoordinatesByIds = async (
  dogIds: string[]
): Promise<Map<string, Coordinate>> => {
  const snapshot = await db
    .collection("dogs")
    .where("id", "in", dogIds)
    .get();

  const map = new Map<string, Coordinate>();

  snapshot.forEach((doc) => {
    const dog = doc.data();
    if (dog.id && dog.coordinate) {
      map.set(dog.id, dog.coordinate);
    }
  });

  return map;
};
