import { Request, Response, NextFunction } from "express";
// import * as admin from "firebase-admin";


// export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split("Bearer ")[1];

//   if (!token) return res.status(401).json({ error: "Missing token" });

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     (req as any).user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

// Temporary mock authentication middleware for local development
// Remove this when deploying to production or when Firebase is set up
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = {
    uid: "UID123Test", 
    email: "test@example.com"
  };

  next();
};
