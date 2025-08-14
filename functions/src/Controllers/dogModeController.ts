import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { updateVaccinations, switchDogMode, updateSocialDogData } from "../services/dogModeService";
import { getDogOwnerIdById } from "../repositories/dogRepository";
import { DogMode } from "../models/config";

// eslint-disable-next-line new-cap
const router = express.Router();

console.log("🐶 Dog Controller Routes Loaded");

// PUT /dogs/:dogId/vaccinations
// Update vaccination dates and automatically check for mode switch
router.put("/:dogId/vaccinations", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /dogs/:dogId/vaccinations hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { coreVaccination1Date, coreVaccination2Date } = req.body;

  // Validation
  if (!dogId) {
    return res.status(400).json({ error: "Dog ID is required" });
  }

  if (!coreVaccination1Date && !coreVaccination2Date) {
    return res.status(400).json({ error: "At least one vaccination date must be provided" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's vaccinations" });
    }

    // Prepare vaccination data (service will handle normalization)
    const vaccinations: {
      coreVaccination1Date?: Date | string;
      coreVaccination2Date?: Date | string;
    } = {};

    if (coreVaccination1Date) {
      vaccinations.coreVaccination1Date = coreVaccination1Date;
    }
    if (coreVaccination2Date) {
      vaccinations.coreVaccination2Date = coreVaccination2Date;
    }

    console.log(`🩺 Updating vaccinations for dog ${dogId}:`, vaccinations);

    // Update vaccinations and check mode switch eligibility
    const result = await updateVaccinations(dogId, vaccinations);

    console.log(`✅ Successfully updated dog ${dogId} vaccinations`);
    console.log(`🔍 Ready to switch mode: ${result.readyToSwitchMode}`);

    // Return updated dog data with mode switch eligibility flags
    return res.status(200).json({
      message: "Vaccinations updated successfully",
      dog: result.dog,
      readyToSwitchMode: result.readyToSwitchMode,
      canSwitchToSocial: result.canSwitchToSocial,
    });
  } catch (error: any) {
    console.error("❌ Failed to update vaccinations:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /dogs/:dogId/modeSwitch
// Manual mode switching endpoint (for testing/admin purposes)
router.post("/:dogId/modeSwitch", authenticate, async (req: Request, res: Response) => {
  console.log("✅ POST /dogs/:dogId/modeSwitch hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { mode } = req.body;

  // Validation
  if (!dogId || !mode) {
    return res.status(400).json({ error: "Dog ID and mode are required" });
  }

  if (!Object.values(DogMode).includes(mode)) {
    return res.status(400).json({ error: "Invalid mode. Must be 'puppy' or 'social'" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only change your own dog's mode" });
    }

    console.log(`🔄 Manual mode switch for dog ${dogId} to ${mode}`);

    // Switch mode
    const updatedDog = await switchDogMode(dogId, mode);

    console.log(`✅ Successfully switched dog ${dogId} to ${mode} mode`);

    // Return updated dog data (already converted to ISO strings by service)
    return res.status(200).json({
      message: `Dog mode successfully changed to ${mode}`,
      dog: updatedDog, // Already converted by service
    });
  } catch (error: any) {
    console.error("❌ Failed to switch mode:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /dogs/:dogId/behavior
// Update social dog data (essential setup after mode switch)
router.put("/:dogId/behavior", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /dogs/:dogId/behavior hit");

  const { dogId } = req.params;
  const userId = (req as any).user?.uid;
  const { isNeutered, behavior } = req.body;

  // Validation
  if (!dogId) {
    return res.status(400).json({ error: "Dog ID is required" });
  }

  if (isNeutered === undefined && !behavior) {
    return res
      .status(400)
      .json({ error: "At least one social data field must be provided (isNeutered or behavior)" });
  }

  try {
    // Check if user owns this dog
    const dogOwnerId = await getDogOwnerIdById(dogId);
    if (!dogOwnerId) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogOwnerId !== userId) {
      return res.status(403).json({ error: "You can only update your own dog's social data" });
    }

    // Prepare social data (essential fields for social mode)
    const socialData: {
      isNeutered?: boolean;
      behavior?: any;
    } = {};

    if (isNeutered !== undefined) {
      socialData.isNeutered = isNeutered;
    }
    if (behavior) {
      socialData.behavior = behavior;
    }

    console.log(`🐕 Updating social data for dog ${dogId}:`, Object.keys(socialData));

    // Update social data
    const updatedDog = await updateSocialDogData(dogId, socialData);

    console.log(`✅ Successfully updated dog ${dogId} social data`);

    // Return updated dog data
    return res.status(200).json({
      message: "Social data updated successfully",
      dog: updatedDog,
    });
  } catch (error: any) {
    console.error("❌ Failed to update social data:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
