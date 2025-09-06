import express, { Request, Response } from "express";
import { scoreAndSortMatches } from "../services/matchScoringService";
import { matchScoringDTO } from "../models/DTO/matchScoringDTO";
import { authenticate } from "../middleware/auth";
import { convertDatesToISO } from "../helper/convertDatesToISO";

// eslint-disable-next-line new-cap
const router = express.Router();
console.log("💚 Match Scoring Routes Loaded");

// This controller handles match scoring requests for dog matches.

// Route: POST /api/matchScoring/score
router.post("/score", authenticate, async (req: Request, res: Response) => {
  console.log("✅ POST /matchScoring/score hit");
  try {
    const input: matchScoringDTO = req.body;
    const result = await scoreAndSortMatches(input);

    // Convert Timestamps to ISO strings (safe conversion)
    const safeResult = result.map((scoredDog) => {
      return {
        ...scoredDog, // Copy all properties of scoredDog (score, dog, etc.)
        dog: convertDatesToISO(scoredDog.dog), // Convert dog object dates to ISO strings
      };
    });
    console.log("💞 Match scoring successful", safeResult.length, "matches found");

    // Return the scored and sorted matches
    return res.status(200).json(safeResult);
  } catch (err: any) {
    console.error("❌ Match scoring error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
