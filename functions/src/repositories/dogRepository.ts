import admin from "../config/firebaseAdmin";
import { Coordinate } from "../models/Coordinate";
import { Dog } from "../models/Dog";

const db = admin.firestore();
const dogsCollection = db.collection("dogs");

// Fetch a single dog by ID for current dog profile
export const getDogById = async (dogId: string): Promise<Dog | null> => {
  const doc = await dogsCollection.doc(dogId).get();
  return doc.exists ? (doc.data() as Dog) : null;
};

// Fetch multiple dogs by their IDs for match scoring
export const getDogsByIds = async (dogIds: string[]): Promise<Dog[]> => {
  const snapshots = await Promise.all(dogIds.map((id) => dogsCollection.doc(id).get()));

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
  const snapshot = await db.collection("dogs").where("id", "in", dogIds).get();

  const map = new Map<string, Coordinate>();

  snapshot.forEach((doc) => {
    const dog = doc.data();
    if (dog.id && dog.coordinate) {
      map.set(dog.id, dog.coordinate);
    }
  });

  return map;
};

// Fetch the owner ID of a dog by its ID
export const getDogOwnerIdById = async (dogId: string): Promise<string | null> => {
  const doc = await admin.firestore().collection("dogs").doc(dogId).get();
  if (!doc.exists) return null;

  const dog = doc.data() as Dog;
  return dog.ownerId ?? null;
};

// Update a dog document with new data
export const updateDog = async (dogId: string, updateData: Partial<Dog>): Promise<void> => {
  await dogsCollection.doc(dogId).update(updateData);
};

// Update dog vaccination dates
export const updateDogVaccinations = async (
  dogId: string,
  vaccinations: {
    coreVaccination1Date?: Date | string;
    coreVaccination2Date?: Date | string;
  }
): Promise<void> => {
  await dogsCollection.doc(dogId).update(vaccinations);
};

export const updateDogHealthStatus = async (dogId: string, health: {
  fleaTreatmentDate?: Date | string;
  wormingTreatmentDate?: Date | string;
}) => {
  const patch: Record<string, any> = {};
  if (health.fleaTreatmentDate) {
    patch["healthStatus.fleaTreatmentDate"] =
      typeof health.fleaTreatmentDate === "string" ?
        new Date(health.fleaTreatmentDate) :
        health.fleaTreatmentDate;
  }
  if (health.wormingTreatmentDate) {
    patch["healthStatus.wormingTreatmentDate"] =
      typeof health.wormingTreatmentDate === "string" ?
        new Date(health.wormingTreatmentDate) :
        health.wormingTreatmentDate;
  }
  if (Object.keys(patch).length === 0) {
    throw new Error("No health fields provided");
  }
  await admin.firestore().collection("dogs").doc(dogId).update(patch);
};

