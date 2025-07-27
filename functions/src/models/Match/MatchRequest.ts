export type MatchRequestStatus = "pending" | "accepted" | "rejected";

export interface MatchRequest {
  id: string;
  fromUserId: string;
  fromDogId: string;
  toUserId: string;
  toDogId: string;
  createdAt: Date;
  status: MatchRequestStatus;
}

// note: The `fromDogId` and `toDogId` fields are added to represent the dogs involved in the match request.
// this model can support one to many relationships if needed in the future.

