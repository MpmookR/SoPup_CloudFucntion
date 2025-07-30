import express from "express";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import corsConfig from "./config/cors";

import matchRequestRoutes from "./controllers/matchRequestController";
import matchScoringRoutes from "./controllers/matchScoringController";

console.log("🔥 Starting full Express app...");

// Express app
const app = express();
app.use(cors(corsConfig));
app.use(express.json());

console.log("✅ All middleware and routes registered.");

// Routes
app.use("/matchRequest", matchRequestRoutes);
app.use("/matchScoring", matchScoringRoutes);

// Export Cloud Function (2nd Gen)
export const api = onRequest(
  {
    timeoutSeconds: 180,
    region: "us-central1",
  },
  app
);

// import express from "express";
// import { onRequest } from "firebase-functions/v2/https";

// const app = express();

// app.get("/", (req, res) => {
//   res.send("Hello from minimal function");
// });

// export const api = onRequest({ timeoutSeconds: 60 }, app);
