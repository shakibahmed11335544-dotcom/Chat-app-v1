import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Simple API
  app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));

  return app;
}

// Create HTTP + WebSocket server
const app = createServer();
const httpServer = createHttpServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// WebRTC Signaling + Call Events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Start Call
  socket.on("start-call", (targetId) => {
    io.to(targetId).emit("incoming-call", { from: socket.id });
  });

  // Accept Call
  socket.on("accept-call", (callerId) => {
    io.to(callerId).emit("call-accepted", { from: socket.id });
  });

  // ICE candidate relay
  socket.on("ice-candidate", (candidate, roomId) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // SDP offer/answer relay
  socket.on("offer", (offer, roomId) => {
    socket.to(roomId).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, roomId) => {
    socket.to(roomId).emit("answer", answer, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
