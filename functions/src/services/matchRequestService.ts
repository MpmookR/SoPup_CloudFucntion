import { MatchRequest } from "../models/Match/MatchRequest";
import admin from "../config/firebaseAdmin";
import { sendPushNotification } from "../services/notificationService";
import { getPushTokenByUserId } from "../repositories/userRepository";
import { createChatRoom } from "./chatService";

const COLLECTION = "matchRequests";

// what is `Omit<MatchRequest, "id" | "createdAt">`?
// It means we are creating a type that has all properties of MatchRequest except for `id` and `createdAt`.
// This is useful when we want to create a new match request without needing to specify those two fields.
export const createMatchRequest = async (
  data: Omit<MatchRequest, "id" | "createdAt">
): Promise<MatchRequest> => {
  // Check for duplicates
  const existing = await admin
    .firestore()
    .collection(COLLECTION)
    .where("fromUserId", "==", data.fromUserId)
    .where("toDogId", "==", data.toDogId)
    .get();

  if (!existing.empty) {
    throw new Error("Match request already exists");
  }

  // Create Firestore doc reference to generate ID once
  const docRef = admin.firestore().collection(COLLECTION).doc();

  const request: MatchRequest = {
    ...data,
    id: docRef.id,
    createdAt: new Date(),
    status: "pending",
  };

  // Save the match request to Firestore
  await docRef.set(request);

  console.log("✅ Match request created:", request);

  // 🔔 Send notification
  try {
    const pushToken = await getPushTokenByUserId(data.toUserId);
    if (pushToken) {
      await sendPushNotification(pushToken, {
        title: "New Match Request 🐶",
        body: "Someone wants to meet your dog! Check the app now.",
        data: {
          type: "match_request",
          fromDogId: data.fromDogId,
          toDogId: data.toDogId,
        },
      });
      console.log("✅ Push notification sent to", data.toUserId);
    } else {
      console.warn("⚠️ No push token found for user:", data.toUserId);
    }
  } catch (error) {
    console.error("❌ Failed to send FCM notification:", error);
  }

  return request;
};

export const getAllMatchRequests = async (): Promise<MatchRequest[]> => {
  const snapshot = await admin
    .firestore()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => doc.data() as MatchRequest);
};

// define the type for match request status
export type matchRequestType = "incoming" | "outgoing" | "accepted";

// This function retrieves match requests based on the type
export const getMatchRequests = async (
  dogId: string,
  type: matchRequestType
): Promise<MatchRequest[]> => {
  const collection = admin.firestore().collection(COLLECTION);

  switch (type) {
  // using the dogId to filter match requests in the case of more than one dog being owned by a user
  case "incoming": {
    // incoming: current dog is the recipient
    const snapshot = await collection
      .where("toDogId", "==", dogId)
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map((doc) => doc.data() as MatchRequest);
  }

  case "outgoing": {
    // outgoing: current dog is the sender
    const snapshot = await collection
      .where("fromDogId", "==", dogId)
      .where("status", "==", "pending")
      .get();
    return snapshot.docs.map((doc) => doc.data() as MatchRequest);
  }

  case "accepted": {
    // Fetches match requests where the dog sent the request and it was accepted.
    const fromSnap = await collection
      .where("fromDogId", "==", dogId)
      .where("status", "==", "accepted")
      .get();

    // Fetches match requests where the dog received the request and it was accepted.
    const toSnap = await collection
      .where("toDogId", "==", dogId)
      .where("status", "==", "accepted")
      .get();

    const fromMatches = fromSnap.docs.map((doc) => doc.data() as MatchRequest);
    const toMatches = toSnap.docs.map((doc) => doc.data() as MatchRequest);

    // Combine both arrays to get all accepted match requests for the dog
    return [...fromMatches, ...toMatches];
  }

  default:
    throw new Error("Invalid match request type");
  }
};

// This function updates the status of a match request
export const updateMatchRequestStatus = async (
  requestId: string,
  newStatus: "accepted" | "rejected"
): Promise<{ chatRoomId?: string }> => {
  const docRef = admin.firestore().collection(COLLECTION).doc(requestId);

  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Match request not found");
  }

  const request = doc.data() as MatchRequest;
  await docRef.update({ status: newStatus, updatedAt: new Date() });

  if (newStatus === "accepted") {
    const pushToken = await getPushTokenByUserId(request.fromUserId);

    if (pushToken) {
      await sendPushNotification(pushToken, {
        title: "Match Accepted 🎉",
        body: `Your match request to ${request.toDogId} has been accepted!`,
        data: {
          type: "match_accepted",
          dogId: request.toDogId,
          requestId,
        },
      });

      console.log("✅ Push notification sent for accepted match");
    } else {
      console.warn("⚠️ No push token found for user:", request.fromUserId);
    }

    // Auto-create chat room after .accepted is called
    const chatRoomId = await createChatRoom(
      request.fromUserId,
      request.fromDogId,
      request.toUserId,
      request.toDogId
    );

    return { chatRoomId }; // Send this back to frontend
  }

  return {};
};

// Check if a pending match request already exists between two dogs
export const checkIfMatchRequestExists = async (
  fromDogId: string,
  toDogId: string
): Promise<boolean> => {
  const snapshot = await admin
    .firestore()
    .collection(COLLECTION)
    .where("fromDogId", "==", fromDogId)
    .where("toDogId", "==", toDogId)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  return !snapshot.empty;
};
