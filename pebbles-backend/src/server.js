import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });
console.log("Loaded ENV:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET
});



import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

/* ----------------- config ----------------- */
const allowedOrigins = [
  "http://localhost:5173",                 // local Vite dev
  "http://localhost:3000",                 // other local ports (optional)
  "https://pebbles-ys4e.onrender.com",       // <-- YOUR VERCEL ORIGIN
  process.env.FRONTEND_URL                  // keep if you set it on Render env
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    // allow curl/postman/no origin requests
    res.header("Access-Control-Allow-Origin", "*");
  } else if (allowedOrigins.includes(origin) || (process.env.ALLOW_ALL_ORIGINS === "true")) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  } else {
    // optional: log blocked origin
    console.warn("CORS blocked origin:", origin);
    // you can respond with 403 OR let the cors() middleware handle it:
    // return res.status(403).json({ error: "CORS blocked" });
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.options("*",cors());
app.use(helmet());
app.use(express.json());

app.get("/api/ping", (req, res) => res.json({ ok: true, time: Date.now() }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);
const authLimiter = rateLimit({ windowMs: 60*1000, max: 10 });
app.use("/api/auth", authLimiter);

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import recentRoutes from "./routes/recentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


app.use("/api/chats", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/recent", recentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

import { createServer } from "http";
import { Server } from "socket.io";

// Create HTTP server
const httpServer = createServer(app);
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // array allowed by socket
    credentials: true,
  },
});


// Attach globally for controllers
global.io = io;

// 1) SOCKET.IO AUTH MIDDLEWARE
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) return next(new Error("Unauthorized: No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("Unauthorized: Invalid user"));

    socket.user = user; // attach user object
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
});

// 2) SOCKET CONNECTION HANDLER

import Chat from "./models/Chat.js";
import Message from "./models/Message.js";

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.fullName, socket.user._id.toString());
  // TYPING INDICATOR
socket.on("typing", (data) => {
  // data: { to, chatId }
  if (!data || !data.to) return;
  io.to(data.to).emit("typing", { from: socket.user._id.toString(), chatId: data.chatId });
});

socket.on("stopTyping", (data) => {
  if (!data || !data.to) return;
  io.to(data.to).emit("stopTyping", { from: socket.user._id.toString(), chatId: data.chatId });
});

// MESSAGE READ (inform other participant)
socket.on("markRead", async (data) => {
  // data: { chatId }
  try {
    const chat = await Chat.findById(data.chatId);
    if (!chat) return;
    // reset unread for this user
    if (chat.unreadCount) {
      chat.unreadCount.set(socket.user._id.toString(), 0);
      await chat.save();
    }
    // notify participants
    const other = chat.participants.find(p => p.toString() !== socket.user._id.toString());
    if (other) io.to(other.toString()).emit("messagesRead", { chatId: data.chatId, by: socket.user._id.toString() });
  } catch (err) {
    console.log("markRead socket error", err);
  }
});

// MESSAGE DELETE propagation (client will call DELETE route then server emits)
socket.on("messageDeleted", ({ messageId, chatId, to }) => {
  if (to) io.to(to).emit("messageDeleted", { messageId, chatId });
});

  socket.join(socket.user._id.toString());

  socket.on("sendMessage", async (data) => {
    try {
      const { to, text, listingId } = data;

      if (!to || !text) return;

      // 1) Find chat (participants = [sender, receiver])
      let chat = await Chat.findOne({
        participants: { $all: [socket.user._id, to] },
      });

      // 2) If not found → create new chat
      if (!chat) {
        chat = await Chat.create({
          participants: [socket.user._id, to],
          listing: listingId || null,
          unreadCount: { [to]: 1 }
        });
      } else {
        // increment unread count for receiver
        const unread = chat.unreadCount.get(to) || 0;
        chat.unreadCount.set(to, unread + 1);
      }

      // 3) Save message
      const message = await Message.create({
        chat: chat._id,
        from: socket.user._id,
        to,
        text,
      });

      // 4) Update last message pointer
      chat.lastMessage = message._id;
      await chat.save();

      // 5) Emit to receiver
      io.to(to).emit("receiveMessage", message);

      // 6) Emit to sender (for UI sync)
      io.to(socket.user._id.toString()).emit("messageSent", message);

    } catch (err) {
      console.log("Socket error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user._id);
  });
});

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        httpServer.listen(process.env.PORT, () => {
            console.log("Server running with Socket.io...");
        });
    })
    .catch(err => console.log(err));

