import { DogMode } from "../models/config";
import { Dog } from "../models/Dog";
import { getDogById, updateDog, updateDogVaccinations } from "../repositories/dogRepository";
import { convertDatesToISO } from "../helper/convertDatesToISO";
import { normalizeDob } from "../helper/dateUtils";

// Update dog vaccination dates and check readiness for mode switch
export const updateVaccinations = async (
  dogId: string,
  vaccinations: {
    coreVaccination1Date?: Date | string;
    coreVaccination2Date?: Date | string;
  }
): Promise<{
  dog: any;
  readyToSwitchMode: boolean;
  canSwitchToSocial: boolean;
}> => {
  // 1. Get current dog data
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // 2. Normalize and update vaccination dates
  const normalizedVaccinations: {
    coreVaccination1Date?: Date | string;
    coreVaccination2Date?: Date | string;
  } = {};

  if (vaccinations.coreVaccination1Date) {
    normalizedVaccinations.coreVaccination1Date =
      normalizeDob(vaccinations.coreVaccination1Date) || vaccinations.coreVaccination1Date;
  }
  if (vaccinations.coreVaccination2Date) {
    normalizedVaccinations.coreVaccination2Date =
      normalizeDob(vaccinations.coreVaccination2Date) || vaccinations.coreVaccination2Date;
  }

  await updateDogVaccinations(dogId, normalizedVaccinations);

  // 3. Get updated dog data and check mode switch eligibility
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) {
    throw new Error("Failed to retrieve updated dog data");
  }

  const readinessCheck = checkIfReadyForModeSwitch(updatedDog);

  console.log(`✅ Successfully updated vaccinations for dog ${dogId}`);
  console.log(`   - Vaccination 1: ${updatedDog.coreVaccination1Date ? "✅" : "❌"}`);
  console.log(`   - Vaccination 2: ${updatedDog.coreVaccination2Date ? "✅" : "❌"}`);
  console.log(`   - Ready to switch: ${readinessCheck.readyToSwitchMode ? "✅" : "❌"}`);

  // Convert dates to ISO strings before returning
  return {
    dog: convertDatesToISO(updatedDog),
    readyToSwitchMode: readinessCheck.readyToSwitchMode,
    canSwitchToSocial: readinessCheck.canSwitchToSocial,
  };
};

// Check if dog is ready for mode switch (without actually switching)
export const checkIfReadyForModeSwitch = (
  dog: Dog
): {
  readyToSwitchMode: boolean;
  canSwitchToSocial: boolean;
} => {
  // Check if dog is in puppy mode and has both vaccinations
  const isInPuppyMode = dog.mode === DogMode.Puppy;
  const hasBothVaccinations = dog.coreVaccination1Date && dog.coreVaccination2Date;

  const readyToSwitchMode = isInPuppyMode && !!hasBothVaccinations;
  const canSwitchToSocial = !!hasBothVaccinations; // Can switch if vaccinations are complete

  return {
    readyToSwitchMode,
    canSwitchToSocial,
  };
};

// Manual mode switch
export const switchDogMode = async (dogId: string, newMode: DogMode): Promise<Dog> => {
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // Validate mode switch rules
  if (currentDog.mode === newMode) {
    throw new Error(`Dog is already in ${newMode} mode`);
  }

  if (newMode === DogMode.Social && currentDog.mode === DogMode.Puppy) {
    // Check if vaccinations are complete before allowing switch to social
    if (!currentDog.coreVaccination1Date || !currentDog.coreVaccination2Date) {
      throw new Error("Cannot switch to social mode: both core vaccinations must be completed");
    }
  }

  await updateDog(dogId, { mode: newMode });
  console.log(`🔄 Dog ${dogId} manually switched from ${currentDog.mode} to ${newMode} mode`);

  const updatedDog = (await getDogById(dogId)) as Dog;
  return convertDatesToISO(updatedDog);
};

// Update social dog data (essential setup after mode switch)
export const updateSocialDogData = async (
  dogId: string,
  socialData: {
    isNeutered?: boolean;
    behavior?: any; // DogBehavior type
  }
): Promise<any> => {
  // 1. Get current dog data
  const currentDog = await getDogById(dogId);
  if (!currentDog) {
    throw new Error("Dog not found");
  }

  // 2. Validate that dog is in social mode
  if (currentDog.mode !== DogMode.Social) {
    throw new Error("Social data can only be updated for dogs in social mode");
  }

  // 3. Update social data (essential fields for social mode)
  await updateDog(dogId, socialData);

  // 4. Get updated dog data
  const updatedDog = await getDogById(dogId);
  if (!updatedDog) {
    throw new Error("Failed to retrieve updated dog data");
  }

  console.log(`✅ Successfully updated social data for dog ${dogId}`);
  console.log(`   - Neutered: ${updatedDog.isNeutered ? "✅" : "❌"}`);
  console.log(`   - Behavior profile: ${updatedDog.behavior ? "✅" : "❌"}`);

  // Convert dates to ISO strings before returning
  return convertDatesToISO(updatedDog);
};
