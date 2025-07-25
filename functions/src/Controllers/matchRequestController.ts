import express from "express";
import { createMatchRequest } from "../services/matchRequestService";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// api/matchRequest/send
router.post("/send", authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { fromDogId, toUserId, toDogId } = req.body;

    const result = await createMatchRequest({
      fromUserId: user.uid,
      fromDogId,
      toUserId,
      toDogId,
      status: "pending", // Default status
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
