import { Review } from "../models/Review";
import admin from "../config/firebaseAdmin";

const db = admin.firestore();

const reviewsCollection = db.collection("reviews");

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
  return snapshot.docs.map(doc => doc.data() as Review);
};
