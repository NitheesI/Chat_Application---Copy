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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://7kvn873c-5173.inc1.devtunnels.ms",
      // Add your production frontend URL here, e.g.:
      // "https://chat-application-copy-8.onrender.com"
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ---- Static file serving (IMPORTANT ORDER) ----
if (process.env.NODE_ENV === "production") {
  // Correctly resolve path to frontend/dist based on backend/src/index.js location
  const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");

  // 1. Serve static assets (css, js, etc.) first
  app.use(express.static(frontendDistPath));

  // 2. For all other routes, serve the frontend's index.html (SPA fallback)
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

