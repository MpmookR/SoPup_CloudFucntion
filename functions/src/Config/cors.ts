import { CorsOptions } from "cors";

// CORS configuration for the application
// origin: where the frontend is hosted

const corsConfig: CorsOptions = {
  origin: [
    "http://192.168.0.49",      // Mac's IP address
    "https://your-production-domain.com",    // will change later once deployed
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies & auth headers
};

export default corsConfig;
