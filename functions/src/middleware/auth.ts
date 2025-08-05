import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

const useMock = process.env.USE_MOCK_AUTH === "true";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (useMock) {
    console.log("🔐 Mock Auth Enabled");
    (req as any).user = {
      uid: "UID123Test",
      email: "test@example.com",
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  console.log("🔐 Incoming Auth Header:", authHeader);

  const token = authHeader?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Authenticated user:", decoded.uid, decoded.name || decoded.email);
    (req as any).user = decoded;
    return next();
  } catch (error) {
    console.error("❌ Invalid token:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
