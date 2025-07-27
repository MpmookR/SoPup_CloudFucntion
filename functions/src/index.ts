import express from "express";
import * as functions from "firebase-functions";
import cors from "cors";
import corsConfig from "./config/cors";
import matchRequestRoutes from "./controllers/matchRequestController";

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use("/matchRequest", matchRequestRoutes);

export const api = functions.https.onRequest(app);
