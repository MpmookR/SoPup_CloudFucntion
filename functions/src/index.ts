import express from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import corsConfig from "./config/cors";

// Importing routes
import matchRequestRoutes from "./controllers/matchRequestController";
import matchScoringRoutes from "./controllers/matchScoringController";

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use("/matchRequest", matchRequestRoutes);
app.use("/matchScoring", matchScoringRoutes);

export const api = functions.https.onRequest(app);
