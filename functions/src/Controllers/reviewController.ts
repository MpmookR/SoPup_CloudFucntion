import express from "express";
import { authenticate } from "../middleware/auth";
import { submitReview, fetchReviewStats } from "../services/reviewService";
import { convertDatesToISO } from "../helper/convertDatesToISO";

// eslint-disable-next-line new-cap
const router = express.Router();
console.log("💚 Review Routes Loaded");

// Route: POST /api/reviews/submit
console.log("✅ Review Submit Route Loaded");
router.post("/submit", authenticate, async (req, res) => {
  try {
    const { meetupId, revieweeId, rating, comment } = req.body;
    const reviewerId = (req as any).user.uid;

    if (!meetupId || !revieweeId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = await submitReview({
      meetupId,
      revieweeId,
      reviewerId,
      rating,
      comment,
    });

    const message = "Review submitted successfully for meetup " + data;

    return res.status(201).json(convertDatesToISO(message));
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return res.status(400).json({ error: "Failed to submit review" });
  }
});

// Route: GET /api/reviews/average/:userId
console.log("✅ Review Stats Route Loaded");
router.get("/average/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const stats = await fetchReviewStats(userId);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching review stats:", error);
    return res.status(400).json({ error: "Failed to fetch review statistics. Please try again later" });
  }
});

export default router;
