import express from "express";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import corsConfig from "./config/cors";

import matchRequestRoutes from "./controllers/matchRequestController";
import matchScoringRoutes from "./controllers/matchScoringController";
import chatRoutes from "./controllers/chatController";
import meetupRoutes from "./controllers/meetupController";
import reviewRoutes from "./controllers/reviewController";
import dogRoutes from "./controllers/dogModeController";

// dev testing routes
// import devRoutes from "./controllers/devController";

console.log("🔥 Starting full Express app...");

// Express app
const app = express();
app.use(cors(corsConfig));
app.use(express.json());

console.log("✅ All middleware and routes registered.");

// Routes
app.use("/matchRequest", matchRequestRoutes);
app.use("/matchScoring", matchScoringRoutes);
app.use("/chat", chatRoutes);
app.use("/meetups", meetupRoutes);
app.use("/reviews", reviewRoutes);
app.use("/dogs", dogRoutes);

// dev testing routes
// app.use("/dev", devRoutes);

// Export Cloud Function (2nd Gen)
export const api = onRequest(
  {
    timeoutSeconds: 180,
    region: "us-central1",
  },
  app
);
