import admin from "../config/firebaseAdmin";
import { MeetupRequest } from "../models/Chat/MeetupRequest";
import { MeetupRequestUpdateDTO } from "../models/DTO/meetupRequestUpdateDTO";
import { MeetupStatus } from "../models/config";

const db = admin.firestore();
const meetupCollection = db.collection("meetups");

// Create a new meetup document
export const createMeetup = async (meetup: MeetupRequest): Promise<void> => {
  await meetupCollection.doc(meetup.id).set(meetup);
};

// Update fields in an existing meetup document
// for cancelling, rescheduling, etc.
export const updateMeetup = async (
  meetupId: string,
  update: Partial<MeetupRequestUpdateDTO>
): Promise<void> => {
  await meetupCollection.doc(meetupId).update(update);
};

// Get all meetups where user is sender or receiver
export const getMeetupsForUser = async (userId: string): Promise<MeetupRequest[]> => {
  const meetups: MeetupRequest[] = [];

  const senderSnap = await meetupCollection.where("senderId", "==", userId).get();
  senderSnap.forEach((doc) => meetups.push(doc.data() as MeetupRequest));

  const receiverSnap = await meetupCollection.where("receiverId", "==", userId).get();
  receiverSnap.forEach((doc) => meetups.push(doc.data() as MeetupRequest));

  return meetups;
};

// Get a single meetup by its ID
export const getMeetupById = async (meetupId: string): Promise<MeetupRequest | null> => {
  const doc = await meetupCollection.doc(meetupId).get();
  if (!doc.exists) return null;
  return doc.data() as MeetupRequest;
};

// NEW: by direction (relative to a USER)
export const getMeetupsByUserAndDirection = async (
  userId: string,
  direction: "incoming" | "outgoing",
  status?: MeetupStatus
): Promise<MeetupRequest[]> => {
  let q =
    direction === "incoming" ?
      meetupCollection.where("receiverId", "==", userId) :
      meetupCollection.where("senderId", "==", userId);

  if (status) q = q.where("status", "==", status);

  const snap = await q.get();
  return snap.docs.map((d) => d.data() as MeetupRequest);
};

// (optional) both directions in one call
export const getMeetupsForUserWithStatus = async (
  userId: string,
  status?: MeetupStatus
): Promise<MeetupRequest[]> => {
  const [inSnap, outSnap] = await Promise.all([
    (status ?
      meetupCollection.where("receiverId", "==", userId).where("status", "==", status) :
      meetupCollection.where("receiverId", "==", userId)
    ).get(),
    (status ?
      meetupCollection.where("senderId", "==", userId).where("status", "==", status) :
      meetupCollection.where("senderId", "==", userId)
    ).get(),
  ]);

  return [...inSnap.docs, ...outSnap.docs].map((d) => d.data() as MeetupRequest);
};
