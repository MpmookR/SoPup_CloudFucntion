import express from "express";
import { authenticate } from "../middleware/auth";
import {
  submitReview,
  fetchReviewStats,
  fetchUserReviews,
  fetchUserReviewsWithDogInfo,
} from "../services/reviewService";
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

    const review = await submitReview({
      meetupId,
      revieweeId,
      reviewerId,
      rating,
      comment,
    });

    const message = "Review submitted successfully for meetup " + meetupId;
    console.log("💚 Review submitted successfully: " + review);

    return res.status(201).json(convertDatesToISO(message));
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return res.status(400).json({ error: "Failed to submit review" });
  }
});

// Route: GET /api/reviews/average/:userId
// fetch the average review stats for a user
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
    return res
      .status(400)
      .json({ error: "Failed to fetch review statistics. Please try again later" });
  }
});

// Route: GET /api/reviews/user/:userId
// fetch all reviews for a user (for displaying review cards)
console.log("✅ User Reviews Route Loaded");
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const reviews = await fetchUserReviews(userId);
    return res.status(200).json(convertDatesToISO(reviews));
  } catch (error) {
    console.error("❌ Error fetching user reviews:", error);
    return res.status(400).json({ error: "Failed to fetch user reviews. Please try again later" });
  }
});

// Route: GET /api/reviews/user/:userId/enhanced
// fetch all reviews for a user with enhanced dog information for review cards
console.log("✅ Enhanced User Reviews Route Loaded");
router.get("/user/:userId/enhanced", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const enhancedReviews = await fetchUserReviewsWithDogInfo(userId);
    return res.status(200).json(convertDatesToISO(enhancedReviews));
  } catch (error) {
    console.error("❌ Error fetching enhanced user reviews:", error);
    return res
      .status(400)
      .json({ error: "Failed to fetch enhanced user reviews. Please try again later" });
  }
});

export default router;
