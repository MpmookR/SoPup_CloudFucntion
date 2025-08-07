export interface Review {
  id: string;
  meetupId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1–5 stars
  comment?: string;
  createdAt: Date;
}
