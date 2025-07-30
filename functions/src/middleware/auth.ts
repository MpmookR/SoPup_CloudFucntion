import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split("Bearer ")[1];

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

// Temporary mock authentication middleware for local development
// Remove this when deploying to production or when Firebase is set up
// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   (req as any).user = {
//     uid: "UID123Test",
//     email: "test@example.com",
//   };

//   next();
// };
