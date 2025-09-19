import express from "express";
import dotenv from "dotenv";

import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import actionRoutes from "./routes/actionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import assistRoutes from "./routes/assistRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://pace-web-sustainability.netlify.app",
  "https://unsuperior-nenita-neurasthenically.ngrok-free.app" // ngrok (changes if restarted)
];

// ✅ Custom CORS middleware (Express 5 safe)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Parse JSON
app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/profile", profileRoutes);
app.use("/api", assistRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend running");
});

// ✅ Expose safe environment variables (optional)
app.get("/api/env", (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log("🌐 Connected to Supabase DB successfully");
});
