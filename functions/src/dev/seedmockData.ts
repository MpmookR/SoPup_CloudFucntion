import admin from "../config/firebaseAdmin";
const db = admin.firestore();

export const seedMockData = async () => {
  await db.collection("users").doc("user456").set({
    name: "John Doe",
    email: "user456@example.com",
    pushToken: "TEST_PUSH_TOKEN_456"
  });

  await db.collection("users").doc("UID123Test").set({
    name: "Test User",
    email: "test@example.com",
    pushToken: "TEST_PUSH_TOKEN_123"
  });

  await db.collection("dogs").doc("dog123").set({
    ownerId: "UID123Test",
    name: "Scooby",
    mode: "social"
  });

  await db.collection("dogs").doc("dog456").set({
    ownerId: "user456",
    name: "Ryu",
    mode: "social"
  });

  console.log("✅ Seeded user and dog data.");
};
