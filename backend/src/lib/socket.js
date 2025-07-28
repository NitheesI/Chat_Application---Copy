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
      // Add your production frontend URL here
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// { userId: [socketId, ...] }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  let userId = socket.handshake.query.userId;
  if (userId) userId = String(userId);
  console.log("Socket connected:", socket.id, "UserID:", userId);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
  }
  console.log("Online users after connect:", Object.keys(userSocketMap));
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id, "UserID:", userId);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
      }
    }
    console.log("Online users after disconnect:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // ADD: Listen for sendMessage and broadcast
  socket.on("sendMessage", ({ to, message }) => {
    const receiverSocketIds = userSocketMap[to] || [];
    receiverSocketIds.forEach(socketId => {
      io.to(socketId).emit("newMessage", message);
    });
  });
});

export { io, app, server };
