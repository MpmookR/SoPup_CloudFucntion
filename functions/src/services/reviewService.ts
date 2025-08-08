import { Review } from "../models/Review";
import {
  getReviewsByMeetupAndReviewer,
  addReview,
  getReviewsByUserId,
} from "../repositories/reviewRepository";
import { getMeetupById } from "../repositories/meetupRepository";
import { updateUserReviewStats, getUserReviewStats } from "../repositories/userRepository";

export const submitReview = async ({
  meetupId,
  revieweeId,
  reviewerId,
  rating,
  comment,
}: {
  meetupId: string;
  revieweeId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
}): Promise<void> => {
  if (reviewerId === revieweeId) throw new Error("Users cannot review themselves.");

  const meetup = await getMeetupById(meetupId);
  if (!meetup) throw new Error("Meetup not found.");
  if (meetup.status !== "accepted") throw new Error("Meetup is not accepted.");
  if (new Date() <= new Date(meetup.proposedTime)) throw new Error("Meetup has not occurred yet.");

  const existingReview = await getReviewsByMeetupAndReviewer(meetupId, reviewerId);
  if (existingReview) throw new Error("You have already submitted a review for this meetup.");

  const ReviewId = `review_${meetupId}_${reviewerId}_${Date.now()}`;
  const review: Review = {
    id: ReviewId,
    meetupId,
    reviewerId,
    revieweeId,
    rating,
    comment,
    createdAt: new Date(),
  };

  await addReview(review);
  console.log(`✅ Review submitted successfully for meetup ${meetupId} by user ${reviewerId}`);

  const allReviews = await getReviewsByUserId(revieweeId);
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = totalRating / allReviews.length;

  await updateUserReviewStats(revieweeId, {
    averageRating: parseFloat(avg.toFixed(2)), // Round to 2 decimal places
    reviewCount: allReviews.length,
  });

  console.log(
    `✅ User ${revieweeId} review stats updated: avgRating=${avg}, reviewCount=${allReviews.length}`
  );
};

// Fetches the average rating and review count for a user
export const fetchReviewStats = async (userId: string) => {
  const stats = await getUserReviewStats(userId);

  console.log(`✅ Fetched review stats for user ${userId}:`, stats);

  if (!stats) throw new Error("User not found or has no review data");
  return stats;
};
