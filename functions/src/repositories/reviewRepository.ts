import { Review } from "../models/Review";
import admin from "../config/firebaseAdmin";

const db = admin.firestore();

const reviewsCollection = db.collection("reviews");
const usersCollection = db.collection("users");

export const addReview = async (review: Review): Promise<void> => {
  await reviewsCollection.doc(review.id).set(review);
};

export const getReviewsByMeetupAndReviewer = async (meetupId: string, reviewerId: string): Promise<Review | null> => {
  const snapshot = await reviewsCollection
    .where("meetupId", "==", meetupId)
    .where("reviewerId", "==", reviewerId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Review;
};

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  const snapshot = await reviewsCollection.where("revieweeId", "==", userId).get();
  return snapshot.docs.map((doc) => doc.data() as Review);
};

// to write review stats to the user document
export const updateUserReviewStats = async (
  userId: string,
  stats: { averageRating: number; reviewCount: number }
): Promise<void> => {
  await usersCollection.doc(userId).update(stats);
};

// Fetches the review stats for a user
export const getUserReviewStats = async (
  userId: string
): Promise<{ averageRating: number; reviewCount: number } | null> => {
  const doc = await usersCollection.doc(userId).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    averageRating: data?.averageRating ?? 0,
    reviewCount: data?.reviewCount ?? 0,
  };
};
