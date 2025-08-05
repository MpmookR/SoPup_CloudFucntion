import express, { Request, Response } from "express";
import { createChatRoom } from "../services/chatService";
import { authenticate } from "../middleware/auth";
import { MessageType } from "../models/config";
import { sendMessage } from "../services/chatService"; 
import { convertDatesToISO } from "../helper/convertDatesToISO";

// eslint-disable-next-line new-cap
const router = express.Router();
console.log("💚 Chat Routes Loaded");

// POST /chat/createRoom
router.post("/createRoom", authenticate, async (req: Request, res: Response) => {
  const fromUserId = (req as any).user?.uid;
  const { fromDogId, toDogId, toUserId } = req.body;

  if (!fromUserId || !fromDogId || !toDogId || !toUserId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const chatRoomId = await createChatRoom(fromUserId, fromDogId, toUserId, toDogId);
    return res.status(200).json(convertDatesToISO({ chatRoomId }));
  } catch (error: any) {
    console.error("❌ Failed to create chat room:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// POST /chat/sendMessage
console.log("✅ sendMessage Route reached");
router.post("/sendMessage", authenticate, async (req: Request, res: Response) => {
  const senderId = (req as any).user?.uid;
  const {
    chatRoomId,
    text,
    receiverId,
    senderDogId,
    receiverDogId
  } = req.body;

  if (!chatRoomId || !text || !receiverId || !senderDogId || !receiverDogId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const message = await sendMessage(chatRoomId, {
      text,
      senderId,
      receiverId,
      senderDogId,
      receiverDogId,
      messageType: MessageType.text,
    });

    return res.status(201).json(convertDatesToISO(message));
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});


export default router;
