import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetProfile,
  handleUpdateProfile,
  handleGetUsers,
  initializeDemoUsers
} from "./routes/auth";
import { 
  handleSendMessage, 
  handleGetMessages, 
  handleGetChats, 
  handleCreateChat, 
  handleDeleteMessage, 
  handleEditMessage, 
  handleMarkAsRead,
  initializeDemoData 
} from "./routes/messages";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize demo data
  initializeDemoData();
  initializeDemoUsers();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/profile", handleGetProfile);
  app.put("/api/auth/profile", handleUpdateProfile);
  app.get("/api/auth/users", handleGetUsers);

  // Messaging routes
  app.post("/api/messages/send", handleSendMessage);
  app.get("/api/messages/:chatId", handleGetMessages);
  app.get("/api/chats", handleGetChats);
  app.post("/api/chats", handleCreateChat);
  app.delete("/api/messages/:messageId", handleDeleteMessage);
  app.put("/api/messages/:messageId", handleEditMessage);
  app.post("/api/messages/read/:chatId", handleMarkAsRead);

  return app;
}
