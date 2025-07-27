import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://7kvn873c-5173.inc1.devtunnels.ms",
      // Add production frontend URL below
      // "https://your-production-frontend-url.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// used to store online users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  // Get userId from query and ensure it's a string
  let userId = socket.handshake.query.userId;
  if (userId) userId = String(userId);

  console.log("Socket connected:", socket.id, "UserID:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Notify clients about online users
  console.log("Online users after connect:", Object.keys(userSocketMap));
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id, "UserID:", userId);
    if (userId) {
      delete userSocketMap[userId];
    }
    console.log("Online users after disconnect:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
