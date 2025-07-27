import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Route Firestore to emulator if running locally
// to save collection in the emulator instead of production
if (process.env.FUNCTIONS_EMULATOR === "true") {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}

const db = admin.firestore();

export default admin;
export const firestore = db;