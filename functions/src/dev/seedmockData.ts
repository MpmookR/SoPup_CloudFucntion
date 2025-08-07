import admin from "../config/firebaseAdmin";
const db = admin.firestore();

export const seedMockData = async () => {
  // Users
  await db.collection("users").doc("user456").set({
    name: "John Doe",
    email: "user456@example.com",
    pushToken: "TEST_PUSH_TOKEN_456",
  });

  await db.collection("users").doc("user123").set({
    name: "Test User",
    email: "test@example.com",
    pushToken: "TEST_PUSH_TOKEN_123",
  });

  await db.collection("users").doc("user789").set({
    name: "Test Puppy",
    email: "puppy@example.com",
    pushToken: "TEST_PUSH_TOKEN_789",
  });

  // Dogs
  await db.collection("dogs").doc("dog123").set({
    ownerId: "user123",
    name: "Scooby",
    mode: "social",
    imageURLs: [],
  });

  await db.collection("dogs").doc("dog456").set({
    ownerId: "user456",
    name: "Ryu",
    mode: "social",
    imageURLs: [],
  });

  await db.collection("dogs").doc("dog789").set({
    ownerId: "user789",
    name: "Puppy Bean",
    mode: "puppy",
    imageURLs: [],
  });

  // Match 
  await db.collection("matches").doc("match_dog123_dog456").set({
    dog1: "dog123",
    dog2: "dog456",
    createdAt: new Date(),
    status: "matched",
  });

    await db.collection("matches").doc("match_dog123_dog789").set({
    dog1: "dog123",
    dog2: "dog789",
    createdAt: new Date(),
    status: "matched",
  });

  // Chat Room
  await db.collection("chatRooms").doc("dog123_dog456").set({
    dogIds: ["dog123", "dog456"],
    lastMessage: {
      text: "Say hi!",
      timestamp: new Date(),
      senderId: "user123",
      messageType: "text",
    },
    createdAt: new Date(),
  });

  // Chat Messages
  const messagesRef = db.collection("chatRooms").doc("dog123_dog456").collection("messages");

  await messagesRef.add({
    text: "Hello from Scooby!",
    senderId: "user123",
    receiverId: "user456",
    senderDogId: "dog123",
    receiverDogId: "dog456",
    timestamp: new Date(),
    messageType: "text",
  });

  await messagesRef.add({
    text: "Hey Scooby! Ryu here 🐶",
    senderId: "user456",
    receiverId: "user123",
    senderDogId: "dog456",
    receiverDogId: "dog123",
    timestamp: new Date(),
    messageType: "text",
  });

  await db.collection("chatRooms").doc("dog123_dog789").set({
    dogIds: ["dog123", "dog789"],
    lastMessage: {
      text: "Say hi!",
      timestamp: new Date(),
      senderId: "user123",
      messageType: "text",
    },
    createdAt: new Date(),
  });
  // Meetups
const now = new Date();
const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days in future

await db.collection("meetups").doc("meetup_past_123_456").set({
  id: "meetup_past_123_456",
  chatRoomId: "dog123_dog456",
  senderId: "user123",
  senderDogId: "dog123",
  receiverId: "user456",
  receiverDogId: "dog456",
  proposedTime: pastDate,
  locationName: "Central Park",
  locationCoordinate: {
    latitude: 40.785091,
    longitude: -73.968285,
  },
  meetUpMessage: "Let’s go for a walk 🐾",
  status: "accepted",
  createdAt: pastDate,
  updatedAt: pastDate,
});

await db.collection("meetups").doc("meetup_upcoming_123_456").set({
  id: "meetup_upcoming_123_456",
  chatRoomId: "dog123_dog456",
  senderId: "user123",
  senderDogId: "dog123",
  receiverId: "user456",
  receiverDogId: "dog456",
  proposedTime: futureDate,
  locationName: "Hyde Park",
  locationCoordinate: {
    latitude: 51.507268,
    longitude: -0.165730,
  },
  meetUpMessage: "Shall we play fetch?",
  status: "accepted",
  createdAt: now,
  updatedAt: now,
});

  console.log("✅ Seeded users, dogs, match, chat room, messages, meetups");
  console.log("✅ Included one past and one upcoming meetup for review testing");

};
