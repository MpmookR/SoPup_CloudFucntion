import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import {
  updateUserProfile,
  updateDogProfile,
  updateDogBehaviorProfile,
  updateDogImages,
  updateHealthStatus,
} from "../services/userProfileService";
import { getDogOwnerIdById } from "../repositories/dogRepository";

// eslint-disable-next-line new-cap
const router = express.Router();

console.log("👤 User Profile Controller Routes Loaded");

// PUT /profile/user/:userId
// Update user profile (name, bio, location, etc.)
router.put("/user/:userId", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /profile/user/:userId hit");

  const { userId } = req.params;
  const authenticatedUserId = (req as any).user?.uid;
  const { name, bio, location, coordinate, language, imageURL } = req.body;

  // Validation
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (userId !== authenticatedUserId) {
    return res.status(403).json({ error: "You can only update your own profile" });
  }

  if (!name && !bio && !location && !coordinate && !language && !imageURL) {
    return res.status(400).json({ error: "At least one profile field must be provided" });
  }

  try {
    // Prepare profile data
    const profileData: {
      name?: string;
      bio?: string;
      location?: string;
      coordinate?: any;
      language?: string;
      imageURL?: string;
    } = {};

    if (name) profileData.name = name;
    if (bio) profileData.bio = bio;
    if (location) profileData.location = location;
    if (coordinate) profileData.coordinate = coordinate;
    if (language) profileData.language = language;
    if (imageURL) profileData.imageURL = imageURL;

    console.log(`👤 Updating user profile for ${userId}:`, Object.keys(profileData));

    // Update user profile
    const updatedUser = await updateUserProfile(userId, profileData);

    console.log(`✅ Successfully updated user ${userId} profile`);

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ Failed to update user profile:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /profile/dog/:dogId/basic
// Update dog basic profile (name, dob, breed, weight, etc.)
router.put("/dog/:dogId/basic", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /profile/dog/:dogId/basic hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { name, dob, breed, weight, gender, size, bio, coordinate } = req.body;

  // Validation
  if (!dogId) {
    return res.status(400).json({ error: "Dog ID is required" });
  }

  if (!name && !dob && !breed && !weight && !gender && !size && !bio && !coordinate) {
    return res.status(400).json({ error: "At least one profile field must be provided" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's profile" });
    }

    // Prepare profile data
    const profileData: {
      name?: string;
      dob?: Date | string;
      breed?: string;
      weight?: number;
      gender?: string;
      size?: string;
      bio?: string;
      coordinate?: any;
    } = {};

    if (name) profileData.name = name;
    if (dob) profileData.dob = dob;
    if (breed) profileData.breed = breed;
    if (weight) profileData.weight = weight;
    if (gender) profileData.gender = gender;
    if (size) profileData.size = size;
    if (bio) profileData.bio = bio;
    if (coordinate) profileData.coordinate = coordinate;

    console.log(`🐕 Updating dog basic profile for ${dogId}:`, Object.keys(profileData));

    // Update dog profile
    const updatedDog = await updateDogProfile(dogId, profileData);

    console.log(`✅ Successfully updated dog ${dogId} basic profile`);

    return res.status(200).json({
      message: "Dog profile updated successfully",
      dog: updatedDog,
    });
  } catch (error: any) {
    console.error("❌ Failed to update dog profile:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /profile/dog/:dogId/behavior
// Update dog behavior profile (general behavior updates)
router.put("/dog/:dogId/behavior", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /profile/dog/:dogId/behavior hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { isNeutered, behavior, healthStatus } = req.body;

  // Validation
  if (!dogId) {
    return res.status(400).json({ error: "Dog ID is required" });
  }

  if (isNeutered === undefined && !behavior && !healthStatus) {
    return res.status(400).json({ error: "At least one behavior field must be provided" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's behavior" });
    }

    // Prepare behavior data
    const behaviorData: {
      isNeutered?: boolean;
      behavior?: any;
      healthStatus?: any;
    } = {};

    if (isNeutered !== undefined) behaviorData.isNeutered = isNeutered;
    if (behavior) behaviorData.behavior = behavior;
    if (healthStatus) behaviorData.healthStatus = healthStatus;

    console.log(`🎾 Updating dog behavior profile for ${dogId}:`, Object.keys(behaviorData));

    // Update behavior profile
    const updatedDog = await updateDogBehaviorProfile(dogId, behaviorData);

    console.log(`✅ Successfully updated dog ${dogId} behavior profile`);

    return res.status(200).json({
      message: "Dog behavior updated successfully",
      dog: updatedDog,
    });
  } catch (error: any) {
    console.error("❌ Failed to update dog behavior:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /profile/dog/:dogId/images
// Update dog images
router.put("/dog/:dogId/images", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /profile/dog/:dogId/images hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { imageURLs } = req.body;

  // Validation
  if (!dogId) {
    return res.status(400).json({ error: "Dog ID is required" });
  }

  if (!imageURLs || !Array.isArray(imageURLs)) {
    return res.status(400).json({ error: "Valid image URLs array is required" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's images" });
    }

    console.log(`📸 Updating dog images for ${dogId}: ${imageURLs.length} images`);

    // Update dog images
    const updatedDog = await updateDogImages(dogId, { imageURLs });

    console.log(`✅ Successfully updated dog ${dogId} images`);

    return res.status(200).json({
      message: "Dog images updated successfully",
      dog: updatedDog,
    });
  } catch (error: any) {
    console.error("❌ Failed to update dog images:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /profile/dog/:dogId/health
// Update dog health status (flea and worming treatment dates)
router.put("/dog/:dogId/health", authenticate, async (req, res) => {
  console.log("✅ PUT /profile/dog/:dogId/health hit");
  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { fleaTreatmentDate, wormingTreatmentDate } = req.body;

  if (!dogId) return res.status(400).json({ error: "Dog ID is required" });
  if (!fleaTreatmentDate && !wormingTreatmentDate) {
    return res.status(400).json({ error: "At least one treatment date must be provided" });
  }

  try {
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) return res.status(404).json({ error: "Dog not found" });
    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's health" });
    }

    const { dog } = await updateHealthStatus(dogId, { fleaTreatmentDate, wormingTreatmentDate });

    return res.status(200).json({
      message: "Dog health status updated successfully",
      dog,
    });
  } catch (err: any) {
    console.error("❌ Failed to update dog health:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
