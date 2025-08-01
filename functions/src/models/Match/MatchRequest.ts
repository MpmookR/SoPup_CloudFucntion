export type MatchRequestStatus = "pending" | "accepted" | "rejected";

export interface MatchRequest {
  id: string;
  fromUserId: string;
  fromDogId: string;
  toUserId: string;
  toDogId: string;
  message: string;
  createdAt: Date;
  status: MatchRequestStatus;
}

