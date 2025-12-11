// src/routes/messageRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessagesForChat,
  getChatsForUser,
  markMessageRead
} from "../controllers/messageController.js";

const router = express.Router();

// Send message (creates chat if needed)
router.post("/send", protect, sendMessage);

// Get messages for a chat
router.get("/chat/:chatId", protect, getMessagesForChat);

// Get chat list for logged-in user
router.get("/conversations", protect, getChatsForUser);

// Mark a message read
router.patch("/message/:messageId/read", protect, markMessageRead);

export default router;
