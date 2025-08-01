import admin from "../config/firebaseAdmin";
// This file handles sending push notifications using Firebase Cloud Messaging (FCM)

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const sendPushNotification = async (token: string, payload: NotificationPayload) => {
  const message = {
    token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ FCM sent:", response);
  } catch (error) {
    console.error("❌ FCM error:", error);
  }
};
