import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp(); // Initialize Firebase Admin SDK
}

// Route Firestore to emulator if running locally
// to save collection in the emulator instead of production
// if emulator is not running, it will use production Firestore
if (process.env.FUNCTIONS_EMULATOR === "true") {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}

console.log("✅ Express app setup complete — exporting Firebase function");

export default admin;
