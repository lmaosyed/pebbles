import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  createOrGetChat,
  getChatsForUser,
  getMessages,
  sendMessage,
  sendImageMessage,
  markMessageRead,
  deleteChat
} from "../controllers/chatController.js";

import {
  uploadAttachments,
  deleteMessageController
} from "../controllers/messageController.js";

const router = express.Router();

/* ---------------------------------------
   ATTACHMENTS (Separate feature)
---------------------------------------- */
router.post("/upload", protect, upload.array("files", 6), uploadAttachments);
router.delete("/message/:messageId", protect, deleteMessageController);

/* ---------------------------------------
   CHAT CORE ROUTES
---------------------------------------- */
router.post("/", protect, createOrGetChat);
router.get("/", protect, getChatsForUser);
router.get("/:chatId/messages", protect, getMessages);

/* ---------------------------------------
   TEXT MESSAGE
---------------------------------------- */
router.post("/send", protect, sendMessage);

/* ---------------------------------------
   IMAGE MESSAGE (IMPORTANT)
---------------------------------------- */
router.post(
  "/send-image",
  protect,
  upload.single("image"),   // multer receives file here
  sendImageMessage          // controller uploads to Cloudinary
);

/* ---------------------------------------
   READ & DELETE ROUTES
---------------------------------------- */
router.put("/message/:messageId/read", protect, markMessageRead);
router.delete("/:chatId", protect, deleteChat);

export default router;
