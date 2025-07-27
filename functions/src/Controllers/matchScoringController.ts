import express, { Request, Response } from "express";
import { scoreAndSortMatches } from "../services/MatchScoringService";
import { MatchScoringDTO } from "../models/Match/MatchScoringDTO";
import { authenticate } from "../middleware/auth";

const router = express.Router();
console.log("💚 Match Scoring Routes Loaded");

// This controller handles match scoring requests for dog matches.

// Route: POST /api/matchScoring/score
router.post("/score", authenticate, async (req: Request, res: Response) => {
  try {
    const input: MatchScoringDTO = req.body;
    const result = await scoreAndSortMatches(input);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Match scoring error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
