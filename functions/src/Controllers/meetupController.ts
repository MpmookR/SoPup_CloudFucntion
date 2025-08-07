import express from "express";
import {
  createMeetupRequest,
  updateMeetupStatus,
  cancelMeetupRequest,
  fetchUserMeetups,
} from "../services/meetupService";
import { convertDatesToISO } from "../helper/convertDatesToISO";
import { authenticate } from "../middleware/auth";

// eslint-disable-next-line new-cap
const router = express.Router();
console.log("💚 Meetup Routes Loaded");

// Route: POST /api/meetups/:chatRoomId/create
console.log("✅ Meetup Routes Loaded");
router.post("/:chatRoomId/create", authenticate, async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { meetup, senderId, receiverId, senderDogId, receiverDogId } = req.body;

    const message = await createMeetupRequest(
      chatRoomId,
      meetup,
      senderId,
      receiverId,
      senderDogId,
      receiverDogId
    );

    res.status(201).json(convertDatesToISO(message));
  } catch (error) {
    console.error("❌ Error creating meetup request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Update meet-up status (accepted/rejected)
// Route: POST /api/meetups/:chatRoomId/update-status
console.log("✅ Meetup Status Update Route Loaded");
router.post("/:chatRoomId/create", authenticate, async (req, res) => {
  const chatRoomId = req.params.chatRoomId.replace(/^:/, ""); // remove leading colon
  try {
    const { meetupId, status, senderId, receiverId } = req.body;

    await updateMeetupStatus(chatRoomId, meetupId, status, senderId, receiverId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error updating meetup status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Update meet-up details (reschedule/cancel)
// Route: POST /api/meetups/:chatRoomId/update-details
console.log("✅ Meetup Details Update Route Loaded");
router.put("/:chatRoomId/cancel", authenticate, async (req, res) => {
   const chatRoomId = req.params.chatRoomId.replace(/^:/, ""); // remove leading colon
  try {
    
    const { update, senderId, receiverId } = req.body;

    await cancelMeetupRequest(chatRoomId, update.id, senderId, receiverId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error updating meetup details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Fetch all meetups related to a user
console.log("✅ Meetup User Fetch Route Loaded");
router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const meetups = await fetchUserMeetups(userId);
    res.status(200).json(meetups.map(convertDatesToISO));
  } catch (error) {
    console.error("❌ Error fetching user meetups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
