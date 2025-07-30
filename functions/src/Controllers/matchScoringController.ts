import express, { Request, Response } from "express";
import { scoreAndSortMatches } from "../services/matchScoringService";
import { matchScoringDTO } from "../models/Match/matchScoringDTO";
import { authenticate } from "../middleware/auth";

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
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Match scoring error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
