import {
  getDogById,
  updateDog,
  updateDogHealthStatus as repoUpdateDogHealthStatus,
} from "../repositories/dogRepository";
import { getUserById, updateUser } from "../repositories/userRepository";
import { convertDatesToISO } from "../helper/convertDatesToISO";
import { normalizeDob } from "../helper/dateUtils";

// Update user profile (name, bio, location, etc.)
export const updateUserProfile = async (
  userId: string,
  profileData: {
    name?: string;
    bio?: string;
    location?: string;
    coordinate?: any;
    language?: string;
    imageURL?: string;
  }
): Promise<any> => {
  // 1. Get current user data
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  // 2. Update user profile
  await updateUser(userId, profileData);

  // 3. Get updated user data
  const updatedUser = await getUserById(userId);
  if (!updatedUser) {
    throw new Error("Failed to retrieve updated user data");
  }

  console.log(`✅ Successfully updated user profile for ${userId}`);
  console.log(`   - Name: ${updatedUser.name}`);
  console.log(`   - Location: ${updatedUser.location}`);

  return convertDatesToISO(updatedUser);
};

// Update dog profile (name, dob, breed, weight, etc.)
export const updateDogProfile = async (
  dogId: string,
  profileData: {
    name?: string;
    dob?: Date | string;
    breed?: string;
    weight?: number;
    gender?: string;
    size?: string;
    bio?: string;
    coordinate?: any;
  }
): Promise<any> => {
  // 1. Get current dog data
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // 2. Normalize date if provided
  const normalizedData: any = { ...profileData };
  if (profileData.dob) {
    normalizedData.dob = normalizeDob(profileData.dob) || profileData.dob;
  }

  // 3. Update dog profile
  await updateDog(dogId, normalizedData);

  // 4. Get updated dog data
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) {
    throw new Error("Failed to retrieve updated dog data");
  }

  console.log(`✅ Successfully updated dog profile for ${dogId}`);
  console.log(`   - Name: ${updatedDog.name}`);
  console.log(`   - Breed: ${updatedDog.breed}`);
  console.log(`   - Weight: ${updatedDog.weight}kg`);

  return convertDatesToISO(updatedDog);
};

// Update dog behavior (general behavior updates, not mode-specific)
export const updateDogBehaviorProfile = async (
  dogId: string,
  behaviorData: {
    isNeutered?: boolean;
    behavior?: any; // DogBehavior type
    healthStatus?: any; // HealthStatus type
  }
): Promise<any> => {
  // 1. Get current dog data
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // 2. Update behavior data (no mode restrictions for general updates)
  await updateDog(dogId, behaviorData);

  // 3. Get updated dog data
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) {
    throw new Error("Failed to retrieve updated dog data");
  }

  console.log(`✅ Successfully updated dog behavior profile for ${dogId}`);
  console.log(`   - Neutered: ${updatedDog.isNeutered ? "✅" : "❌"}`);
  console.log(`   - Behavior profile: ${updatedDog.behavior ? "✅" : "❌"}`);
  console.log(`   - Health status: ${updatedDog.healthStatus ? "✅" : "❌"}`);

  return convertDatesToISO(updatedDog);
};

// Update dog images
export const updateDogImages = async (
  dogId: string,
  imageData: {
    imageURLs: string[];
  }
): Promise<any> => {
  // 1. Get current dog data
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // 2. Validate image URLs
  if (!imageData.imageURLs || !Array.isArray(imageData.imageURLs)) {
    throw new Error("Invalid image URLs provided");
  }

  // 3. Update dog images
  await updateDog(dogId, { imageURLs: imageData.imageURLs });

  // 4. Get updated dog data
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) {
    throw new Error("Failed to retrieve updated dog data");
  }

  console.log(`✅ Successfully updated dog images for ${dogId}`);
  console.log(`   - Number of images: ${updatedDog.imageURLs.length}`);

  return convertDatesToISO(updatedDog);
};

// Update dog health status
export const updateHealthStatus = async (
  dogId: string,
  health: {
    fleaTreatmentDate?: Date | string;
    wormingTreatmentDate?: Date | string;
  }
): Promise<{ dog: any }> => {
  // 1) Load current dog
  const currentDog = await getDogById(dogId);
  if (!currentDog) throw new Error("Dog not found");

  // 2) Normalize inputs (keeps parity with vaccination flow)
  const patch: {
    fleaTreatmentDate?: Date | string;
    wormingTreatmentDate?: Date | string;
  } = {};

  if (health.fleaTreatmentDate) {
    patch.fleaTreatmentDate =
      normalizeDob(health.fleaTreatmentDate) || health.fleaTreatmentDate;
  }
  if (health.wormingTreatmentDate) {
    patch.wormingTreatmentDate =
      normalizeDob(health.wormingTreatmentDate) || health.wormingTreatmentDate;
  }

  if (!patch.fleaTreatmentDate && !patch.wormingTreatmentDate) {
    throw new Error("At least one health field must be provided");
  }

  // 3) Patch update via repository (dot-path; no overwrites)
  await repoUpdateDogHealthStatus(dogId, patch);

  // 4) Return updated dog
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) throw new Error("Failed to retrieve updated dog data");

  return { dog: convertDatesToISO(updatedDog) };
};
