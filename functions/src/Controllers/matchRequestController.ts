import express, { Request, Response } from "express";
import {
  createMatchRequest,
  updateMatchRequestStatus,
  getMatchRequests,
  matchRequestType,
  getAllMatchRequests,
} from "../services/matchRequestService";
import { authenticate } from "../middleware/auth";

// eslint-disable-next-line new-cap
const router = express.Router();
console.log("💚 Match Request Routes Loaded");

// api/matchRequest
router.get("/", (req: Request, res: Response) => {
  console.log("✅ GET /matchRequest hit");
  return res.status(200).json({ message: "GET /matchRequest route hit" });
});

// api/matchRequest/all
router.get("/all", authenticate, async (req: Request, res: Response) => {
  try {
    const requests = await getAllMatchRequests();
    return res.status(200).json(requests);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// api/matchRequest/send
router.post("/send", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fromDogId, toUserId, toDogId } = req.body;

    const result = await createMatchRequest({
      fromUserId: user.uid,
      fromDogId,
      toUserId,
      toDogId,
      status: "pending",
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// api/matchRequest/:id/status
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await updateMatchRequestStatus(id, status);
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err: any) {
    if (err.message === "Match request not found") {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// api/matchRequest/:dogId?type=incoming|outgoing|accepted
router.get("/:dogId", async (req: Request, res: Response) => {
  const { dogId } = req.params;
  const { type } = req.query;

  if (!["incoming", "outgoing", "accepted"].includes(type as string)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const requests = await getMatchRequests(dogId, type as matchRequestType);
    return res.status(200).json(requests);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
