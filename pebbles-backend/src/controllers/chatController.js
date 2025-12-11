import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });
};


// Create or get existing chat between two users (optionally for a listing)
export const createOrGetChat = async (req, res) => {
  try {
    const { otherUserId, listingId } = req.body;
    if (!otherUserId) return res.status(400).json({ message: "otherUserId required" });

    // ensure participants are unique and consistent order
    const participants = [req.user._id.toString(), otherUserId.toString()].sort();

    let chat = await Chat.findOne({ participants });

    if (!chat) {
      chat = await Chat.create({
        participants,
        listing: listingId || null,
        unreadCount: { }
      });
    }

    chat = await Chat.findById(chat._id).populate("participants", "fullName email profileImage");

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get chat list for a user (paginated) with last message preview
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

    // for each chat, compute unread for this user
    const formatted = await Promise.all(chats.map(async (c) => {
      const lastMsg = c.lastMessage ? await Message.findById(c.lastMessage).lean() : null;
      const other = c.participants.find(p => p._id.toString() !== req.user._id.toString());
      const unread = (c.unreadCount && c.unreadCount.get(req.user._id.toString())) || 0;
      return { chat: c, lastMessage: lastMsg, otherUser: other, unread };
    }));

    res.json({ page, chats: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages for a chat (paginated)
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // check membership
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.map(p => p.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Not a participant" });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // mark as read messages addressed to this user
    await Message.updateMany({ chat: chatId, to: req.user._id, read: false }, { $set: { read: true }});

    // reset unread counter for this user
    if (chat.unreadCount && chat.unreadCount.get(req.user._id.toString())) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    }

    res.json({ page, messages: messages.reverse() }); // oldest-first for UI
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Send a message (body: chatId OR otherUserId & text & optional attachments)
export const sendMessage = async (req, res) => {
  try {
    const { chatId, otherUserId, text, attachments } = req.body;
    let chat = null;

    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });
      if (!chat.participants.map(p => p.toString()).includes(req.user._id.toString())) {
        return res.status(403).json({ message: "Not a participant" });
      }
    } else {
      // create or get chat
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
    const prev = chat.unreadCount && chat.unreadCount.get(to.toString()) ? chat.unreadCount.get(to.toString()) : 0;
    chat.unreadCount = chat.unreadCount || new Map();
    chat.unreadCount.set(to.toString(), Number(prev) + 1);
    await chat.save();

    const populatedMsg = await Message.findById(message._id).populate("from", "fullName profileImage");

    // Optionally emit via socket.io (if server exports io)
    if (global.io) {
      global.io.to(to.toString()).emit("receiveMessage", populatedMsg);
      global.io.to(req.user._id.toString()).emit("messageSent", populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// DELETE A CHAT
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Ensure chat belongs to this user
    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });

  } catch (err) {
    console.log("DELETE CHAT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const sendImageMessage = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Upload from buffer → Cloudinary
    const uploadRes = await uploadBufferToCloudinary(
      req.file.buffer,
      "chat_images"
    );

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const senderId = req.user._id;
    const receiverId = chat.participants.find(
      (p) => p.toString() !== senderId.toString()
    );

    if (!receiverId) {
      return res.status(400).json({ message: "Could not determine receiver" });
    }

    const message = await Message.create({
      chat: chatId,
      from: senderId,
      to: receiverId,
      image: uploadRes.secure_url,
      text: ""
    });

    chat.lastMessage = message._id;
    chat.unreadCount.set(
      receiverId.toString(),
      (chat.unreadCount.get(receiverId.toString()) || 0) + 1
    );
    await chat.save();

    const populatedMsg = await Message.findById(message._id).populate(
      "from",
      "fullName profileImage"
    );

    if (global.io) {
      global.io.to(receiverId.toString()).emit("receiveMessage", populatedMsg);
      global.io.to(senderId.toString()).emit("messageSent", populatedMsg);
    }

    res.json(populatedMsg);
  } catch (err) {
    console.error("IMAGE SEND ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};






// Mark individual message as read
export const markMessageRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.to.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not allowed" });

    msg.read = true;
    await msg.save();

    // decrement unread count on chat
    const chat = await Chat.findById(msg.chat);
    const curr = chat.unreadCount && chat.unreadCount.get(req.user._id.toString());
    if (curr) {
      chat.unreadCount.set(req.user._id.toString(), Math.max(0, curr - 1));
      await chat.save();
    }

    res.json({ message: "Marked read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
