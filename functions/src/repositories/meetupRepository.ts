import admin from "../config/firebaseAdmin";
import { MeetupRequest } from "../models/Chat/MeetupRequest";
import { MeetupRequestUpdateDTO } from "../models/DTO/meetupRequestUpdateDTO";

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
