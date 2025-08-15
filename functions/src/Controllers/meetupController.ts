import express, { Request, Response } from "express";
import {
  createMeetupRequest,
  updateMeetupStatus,
  cancelMeetupRequest,
  fetchMeetupsByType,
  fetchAllMeetupsForUser,
  completeMeetupRequest,
} from "../services/meetupService";
import { convertDatesToISO } from "../helper/convertDatesToISO";
import { authenticate } from "../middleware/auth";
import { getMeetupById } from "../repositories/meetupRepository";
import { MeetupStatus } from "../models/config";

// eslint-disable-next-line new-cap
const router = express.Router();

console.log("🤝 Meetup Controller Routes Loaded");

// POST /meetups/:chatRoomId/create
// Create a new meetup request
router.post("/:chatRoomId/create", authenticate, async (req: Request, res: Response) => {
  console.log("✅ POST /meetups/:chatRoomId/create hit");

  const { chatRoomId } = req.params;
  const userId = (req as any).user?.uid;
  const { meetup, senderId, receiverId, senderDogId, receiverDogId } = req.body;

  // Validation
  if (!chatRoomId || !meetup || !senderId || !receiverId || !senderDogId || !receiverDogId) {
    return res.status(400).json({
      error:
        "Missing required fields: chatRoomId, meetup, senderId, receiverId, senderDogId, receiverDogId",
    });
  }

  // Verify authenticated user is the sender
  if (senderId !== userId) {
    return res.status(403).json({ error: "You can only create meetup requests as yourself" });
  }

  try {
    const message = await createMeetupRequest(
      chatRoomId,
      meetup,
      senderId,
      receiverId,
      senderDogId,
      receiverDogId
    );

    console.log(`✅ Created meetup request in chat room ${chatRoomId}`);
    return res.status(201).json({
      message: "Meetup request created successfully",
      data: convertDatesToISO(message),
    });
  } catch (error: any) {
    console.error("❌ Error creating meetup request:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// PUT /meetups/:chatRoomId/:meetupId/status
// Update meetup status (accept/reject)
router.put("/:chatRoomId/:meetupId/status", authenticate, async (req: Request, res: Response) => {
  console.log("✅ PUT /meetups/:chatRoomId/:meetupId/status hit");

  const { chatRoomId, meetupId } = req.params;
  const authUserId = (req as any).user?.uid;
  const { status } = req.body as { status?: string };

  if (!chatRoomId || !meetupId || !status) {
    return res.status(400).json({ error: "Missing required fields: chatRoomId, meetupId, status" });
  }
  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
  }

  try {
    const meetup = await getMeetupById(meetupId);
    if (!meetup) return res.status(404).json({ error: "Meetup not found" });
    if (authUserId !== meetup.receiverId) {
      return res.status(403).json({ error: "You can only respond to meetup requests sent to you" });
    }

    await updateMeetupStatus(chatRoomId, meetupId, status as MeetupStatus, authUserId, meetup.receiverId);
    return res.status(200).json({ message: `Meetup request ${status} successfully`, success: true });
  } catch (error: any) {
    const code = error.status ?? 500;
    console.error("❌ Error updating meetup status:", error.message);
    return res.status(code).json({ error: error.message || "Internal server error" });
  }
});

// DELETE /meetups/:chatRoomId/:meetupId
// Cancel a meetup request
router.delete("/:chatRoomId/:meetupId", authenticate, async (req: Request, res: Response) => {
  console.log("✅ DELETE /meetups/:chatRoomId/:meetupId hit");

  const { chatRoomId, meetupId } = req.params;
  const requesterUserId = (req as any).user?.uid;
  if (!chatRoomId || !meetupId) {
    return res.status(400).json({ error: "Missing required fields: chatRoomId, meetupId" });
  }

  try {
    await cancelMeetupRequest(chatRoomId, meetupId, requesterUserId);

    return res.status(200).json({ message: "Meetup request cancelled successfully", success: true });
  } catch (err: any) {
    const status = err.status ?? 500; // 403/409 bubbled from service
    console.error("❌ Error cancelling meetup:", err.message);
    return res.status(status).json({ error: err.message || "Internal server error" });
  }
});

// GET /meetups/user/:userId?type=incoming|outgoing&status=pending|accepted|rejected|cancelled|completed
router.get("/user/:userId", authenticate, async (req, res) => {
  console.log("✅ GET /meetups/user/:userId hit");
  const { userId } = req.params;
  const authId = (req as any).user?.uid;
  const { type, status } = req.query as { type?: string; status?: string };

  if (userId !== authId) {
    return res.status(403).json({ error: "You can only view your own meetups" });
  }

  // Validate status query
  const allowedStatuses: string[] = ["pending", "accepted", "rejected", "cancelled", "completed"];
  // normalize the status to the MeetupStatus enum
  const normalizedStatus = status && allowedStatuses.includes(status) ? (status as MeetupStatus) : undefined;
  if (status && !normalizedStatus) {
    return res.status(400).json({ error: "Invalid status filter" });
  }
  if (type && !["incoming", "outgoing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type filter" });
  }

  try {
    const meetups =
      type === "incoming" || type === "outgoing" ?
        await fetchMeetupsByType(userId, type as "incoming" | "outgoing", normalizedStatus) :
        await fetchAllMeetupsForUser(userId, normalizedStatus);

    return res.status(200).json({
      message: "Meetups retrieved successfully",
      meetups: meetups.map(convertDatesToISO),
    });
  } catch (e: any) {
    console.error("❌ Error fetching user meetups:", e.message);
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// PUT /meetups/:chatRoomId/:meetupId/complete
// Mark a meetup as completed
router.put("/:chatRoomId/:meetupId/complete", authenticate, async (req, res) => {
  console.log("✅ PUT /meetups/:chatRoomId/:meetupId/complete hit");

  const { chatRoomId, meetupId } = req.params;
  const requesterUserId = (req as any).user?.uid;

  try {
    await completeMeetupRequest(chatRoomId, meetupId, requesterUserId);
    return res.status(200).json({ message: "Meet-up marked as completed", success: true });
  } catch (err: any) {
    const code = err.status ?? 500;
    console.error("❌ Error completing meetup:", err.message);
    return res.status(code).json({ error: err.message ?? "Internal server error" });
  }
});

export default router;
