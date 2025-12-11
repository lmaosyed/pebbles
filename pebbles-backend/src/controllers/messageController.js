// src/controllers/messageController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
// Send a message (body: chatId OR otherUserId & text & optional attachments)
// Returns the populated message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, otherUserId, text, attachments } = req.body;

    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: "text or attachments required" });
    }

    let chat = null;

    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      const isMember = chat.participants.map(p => p.toString()).includes(req.user._id.toString());
      if (!isMember) return res.status(403).json({ message: "Not a participant" });
    } else {
      if (!otherUserId) return res.status(400).json({ message: "otherUserId required" });
      const participants = [req.user._id.toString(), otherUserId.toString()].sort();
      chat = await Chat.findOne({ participants });
      if (!chat) {
        chat = await Chat.create({ participants, listing: null, unreadCount: {} });
      }
    }

    const to = chat.participants.find(p => p.toString() !== req.user._id.toString());

    const message = await Message.create({
      chat: chat._id,
      from: req.user._id,
      to,
      text: text || "",
      attachments: attachments || []
    });

    // update chat lastMessage and increment unread for recipient
    chat.lastMessage = message._id;

    // ensure unreadCount is a Map-like object for mongoose
    const prev = (chat.unreadCount && chat.unreadCount.get && chat.unreadCount.get(to.toString())) || (chat.unreadCount && chat.unreadCount[to.toString()]) || 0;
    // Mongoose Map setter
    if (chat.unreadCount && chat.unreadCount.set) {
      chat.unreadCount.set(to.toString(), Number(prev) + 1);
    } else {
      chat.unreadCount = chat.unreadCount || {};
      chat.unreadCount[to.toString()] = Number(prev) + 1;
    }

    await chat.save();

    const populated = await Message.findById(message._id)
      .populate("from", "fullName profileImage")
      .lean();

    // Emit over Socket.IO if available
    try {
      if (global.io) {
        global.io.to(to.toString()).emit("receiveMessage", populated);
        global.io.to(req.user._id.toString()).emit("messageSent", populated);
      }
    } catch (e) {
      // don't fail on socket emission errors
      console.warn("Socket emission failed:", e.message || e);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: err.message });
  }
};

// upload attachments (used by frontend to upload files first)
export const uploadAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.json({ urls: [] });

    const urls = [];
    for (const file of req.files) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "pebbles/messages" }, (err, result) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        });
        stream.end(file.buffer);
      });
      urls.push(uploadResult);
    }

    res.status(201).json({ urls });
  } catch (err) {
    console.error("UPLOAD ATTACHMENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// delete a message (soft/hard depending)
export const deleteMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.from.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    await msg.deleteOne();

    // notify other participant via io
    const chat = await Chat.findById(msg.chat);
    const other = chat.participants.find(p => p.toString() !== req.user._id.toString());
    if (global.io && other) {
      global.io.to(other.toString()).emit("messageDeleted", { messageId, chatId: chat._id.toString() });
      global.io.to(req.user._id.toString()).emit("messageDeleted", { messageId, chatId: chat._id.toString() });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages for a chat (paginated)
export const getMessagesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (!chat.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("from", "fullName profileImage")
      .lean();

    // mark unread -> read for this user
    await Message.updateMany({ chat: chatId, to: req.user._id, read: false }, { $set: { read: true } });

    // reset unread counter for this user
    if (chat.unreadCount && chat.unreadCount.get) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    } else if (chat.unreadCount) {
      chat.unreadCount[req.user._id.toString()] = 0;
      await chat.save();
    }

    res.json({ page, messages: messages.reverse() }); // oldest -> newest for UI
  } catch (err) {
    console.error("getMessagesForChat error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get list of chats for logged-in user (paginated + lastMessage)
export const getChatsForUser = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("lastMessage")
      .populate("participants", "fullName profileImage");

    const formatted = await Promise.all(chats.map(async (c) => {
      const lastMsg = c.lastMessage ? await Message.findById(c.lastMessage).lean() : null;
      const other = c.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unread = (c.unreadCount && c.unreadCount.get && c.unreadCount.get(req.user._id.toString())) || (c.unreadCount && c.unreadCount[req.user._id.toString()]) || 0;
      return { chat: c, lastMessage: lastMsg, otherUser: other, unread };
    }));

    res.json({ page, chats: formatted });
  } catch (err) {
    console.error("getChatsForUser error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Mark a message as read
export const markMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.to.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    msg.read = true;
    await msg.save();

    // decrement unread count on chat if exists
    const chat = await Chat.findById(msg.chat);
    if (chat) {
      const curr = (chat.unreadCount && chat.unreadCount.get && chat.unreadCount.get(req.user._id.toString())) || (chat.unreadCount && chat.unreadCount[req.user._id.toString()]) || 0;
      const newVal = Math.max(0, curr - 1);
      if (chat.unreadCount && chat.unreadCount.set) {
        chat.unreadCount.set(req.user._id.toString(), newVal);
      } else {
        chat.unreadCount[req.user._id.toString()] = newVal;
      }
      await chat.save();
    }

    res.json({ message: "Marked read" });
  } catch (err) {
    console.error("markMessageRead error:", err);
    res.status(500).json({ message: err.message });
  }
};
