import express from "express";
import functions from "firebase-functions";
import cors from "cors";
import corsConfig from "./Config/cors";
import matchRequestRoutes from "./Controllers/matchRequestController";

const app = express();

app.use(cors(corsConfig));
app.use(express.json());

app.use("/matchRequest", matchRequestRoutes);


export const api = functions.https.onRequest(app);
