import { Review } from "../models/Review";
import {
  getReviewsByMeetupAndReviewer,
  addReview,
  getReviewsByUserId,
  updateUserReviewStats,
  getUserReviewStats,
} from "../repositories/reviewRepository";
import { getMeetupById } from "../repositories/meetupRepository";
import { getDogById } from "../repositories/dogRepository";

// Enhanced review interface for display with dog names and images
export interface ReviewWithDogInfo extends Review {
  reviewerDogName?: string;
  revieweeDogName?: string;
  reviewerDogImage?: string;
  revieweeDogImage?: string;
}

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
}): Promise<Review> => {
  if (reviewerId === revieweeId) throw new Error("Users cannot review themselves.");

  const meetup = await getMeetupById(meetupId);
  if (!meetup) throw new Error("Meetup not found.");
  if (meetup.status !== "completed") {
    throw new Error("Meetup must be completed before posting a review.");
  }

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

  return review;
};

// Fetches the average rating and review count for a user
export const fetchReviewStats = async (userId: string) => {
  const stats = await getUserReviewStats(userId);

  console.log(`✅ Fetched review stats for user ${userId}:`, stats);

  if (!stats) throw new Error("User not found or has no review data");
  return stats;
};

// Fetches all reviews for a user (for displaying review cards)
export const fetchUserReviews = async (userId: string) => {
  const reviews = await getReviewsByUserId(userId);

  console.log(`✅ Fetched ${reviews.length} reviews for user ${userId}`);

  return reviews;
};

// Fetches reviews with enhanced dog information and profile pictures for review cards
// Note: createdAt will be a Firestore Timestamp from the database,
// but convertDatesToISO in the controller will convert it to ISO string for the response
export const fetchUserReviewsWithDogInfo = async (userId: string): Promise<ReviewWithDogInfo[]> => {
  const reviews = await getReviewsByUserId(userId);

  const enhanced = await Promise.all(
    reviews.map(async (review) => {
      let reviewerDogName: string | undefined;
      let revieweeDogName: string | undefined;
      let reviewerDogImage: string | undefined;
      let revieweeDogImage: string | undefined;

      try {
        const meetup = await getMeetupById(review.meetupId);
        if (meetup) {
          // Determine which dog belongs to reviewer/reviewee
          const reviewerDogId =
            review.reviewerId === meetup.senderId ? meetup.senderDogId : meetup.receiverDogId;

          const revieweeDogId =
            review.revieweeId === meetup.senderId ? meetup.senderDogId : meetup.receiverDogId;

          const [reviewerDog, revieweeDog] = await Promise.all([
            getDogById(reviewerDogId),
            getDogById(revieweeDogId),
          ]);

          console.log(`🐕 Reviewer dog: ${reviewerDog?.name ?? "Unknown"} (ID: ${reviewerDogId})`);
          console.log(`🐕 Reviewee dog: ${revieweeDog?.name ?? "Unknown"} (ID: ${revieweeDogId})`);

          reviewerDogName = reviewerDog?.name;
          revieweeDogName = revieweeDog?.name;
          reviewerDogImage = reviewerDog?.imageURLs?.[0];
          revieweeDogImage = revieweeDog?.imageURLs?.[0];
        }
      } catch (error) {
        console.warn(`❌ Failed to enrich review ${review.id}:`, error);
      }

      return { ...review, reviewerDogName, revieweeDogName, reviewerDogImage, revieweeDogImage };
    })
  );

  console.log(`✅ Fetched ${enhanced.length} enhanced reviews with dog images for user ${userId}`);
  return enhanced;
};
