import express, { Request, Response } from "express";
import { seedMockData } from "../dev/seedmockData"; 

const router = express.Router();
console.log("🚀 Dev Controller initialized");

router.post("/seed", async (req: Request, res: Response) => {
  try {
    await seedMockData();
    return res.status(200).json({ message: "✅ Seeded mock data" });
  } catch (error) {
    console.error("❌ Failed to seed data:", error);
    return res.status(500).json({ error: "Failed to seed data" });
  }
});

export default router;
