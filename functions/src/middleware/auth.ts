import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization; // Get the Authorization header
  console.log("🔐 Incoming Auth Header:", authHeader);

  // Extract token from Authorization header
  const token = authHeader?.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    console.log("✅ Authenticated user:", decoded.uid, decoded.name || decoded.email);
    (req as any).user = decoded;
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};

// console.log("🚀 Mock auth middleware loaded");
// Remove this when deploying to production or when Firebase is set up
// TEMPORARY MOCK FOR LOCAL TESTING

// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   (req as any).user = {
//     uid: "UID123Test",
//     email: "test@example.com",
//   };
//   console.log("🔐 Mock Authenticated user:");
//   next();
// };
