import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { io, app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define allowed origins for CORS, including your deployed frontend URL via env variable
const allowedOrigins = [
  "http://localhost:5173",
  "https://7kvn873c-5173.inc1.devtunnels.ms",
  process.env.FRONTEND_URL || "https://chat-application-copy-9.onrender.com", // replace or set in env
];

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration with credential support and origin whitelist
app.use(
  cors({
    origin: (origin, callback) => {
      // Accept requests with no origin (e.g. Postman) or from allowed origins only
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production static files serving (IMPORTANT ORDER)
if (process.env.NODE_ENV === "production") {
  // Resolve path to the frontend build folder correctly
  const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

  // Serve static assets first (CSS, JS, images, etc.)
  app.use(express.static(frontendDistPath));

  // Catch-all route to serve index.html for SPA routing support
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Start server only after DB connection
async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
