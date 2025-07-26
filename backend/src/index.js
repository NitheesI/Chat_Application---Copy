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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure to add your deployed frontend URL here!
const allowedOrigins = [
  "http://localhost:5173",
  "https://7kvn873c-5173.inc1.devtunnels.ms",
  process.env.FRONTEND_URL || "https://chat-application-copy-9.onrender.com", // Add your Render frontend URL
];

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Reflect requests with no origin (like Postman) or in whitelist
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ---- Static file serving (IMPORTANT ORDER) ----
if (process.env.NODE_ENV === "production") {
  // Resolve path to frontend/dist relative to this file
  const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

  // Serve static files first
  app.use(express.static(frontendDistPath));

  // SPA fallback - serve index.html for all other routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

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
