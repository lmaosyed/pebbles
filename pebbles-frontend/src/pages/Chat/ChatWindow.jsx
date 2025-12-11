import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";
import { useParams } from "react-router-dom";
import socket from "../../utils/socket";

import useChatStore from "../../store/chatStore";
import useUserStore from "../../store/userStore";

export default function ChatWindow() {
  const { chatId } = useParams();

  const openChat = useChatStore((s) => s.openChat);
  const messages = useChatStore((s) => s.messages);
  const chats = useChatStore((s) => s.chats);
  const sendMessageFn = useChatStore((s) => s.sendMessage);
  const user = useUserStore((s) => s.user);

  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);


  // ---------------- FIND CHAT OBJECT -------------------
  const chatObject =
    chats.find((c) => c.chat?._id === chatId) ||
    chats.find((c) => c._id === chatId) ||
    null;


  // ---------------- Determine other user ----------------
  let otherUser = null;
  const me = user?._id;

  if (chatObject) {
    if (chatObject.otherUser) otherUser = chatObject.otherUser;

    if (!otherUser && chatObject.chat?.participants) {
      otherUser = chatObject.chat.participants.find((p) => p._id !== me);
    }

    if (!otherUser && chatObject.participants) {
      otherUser = chatObject.participants.find((p) => p._id !== me);
    }
  }


  // ---------------- SOCKET + LOAD MESSAGES --------------
  useEffect(() => {
    openChat(chatId);

    socket.auth = { token: localStorage.getItem("pebbles_token") };
    socket.connect();
    socket.emit("joinRoom", chatId);

    socket.on("receiveMessage", (msg) => {
      if (msg.chat === chatId) openChat(chatId);
    });

    return () => socket.off("receiveMessage");
  }, [chatId]);

  // Scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND TEXT MESSAGE -------------------
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      await sendMessageFn({ chatId, text });
      setText("");

      openChat(chatId);
      useChatStore.getState().fetchChats();
    } catch (err) {
      console.error("Failed to send:", err);
    }
  };

  // ---------------- SEND IMAGE MESSAGE -------------------
  const handleImageSend = async (file) => {
    if (!file) return;

    try {
      await sendMessageFn({
        chatId,
        image: file, // send as file object → chatStore handles upload
      });

      openChat(chatId);
      useChatStore.getState().fetchChats();
    } catch (err) {
      console.error("Image send failed:", err);
    }
  };

  // ------------------------ UI ---------------------------
  return (
    <div className="chatwindow-container">
      {/* HEADER */}
      <div className="chatwindow-header">
        <div
          className="chatwindow-backbtn"
          onClick={() => window.history.back()}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>

        <div className="chatwindow-avatar">
          {otherUser?.profileImage ? (
            <img src={otherUser.profileImage} alt="avatar" />
          ) : (
            <div className="chatwindow-avatar-placeholder">
              {otherUser?.fullName?.[0] || "U"}
            </div>
          )}
        </div>

        <div className="chatwindow-userinfo">
          <div className="chatwindow-name">{otherUser?.fullName}</div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chatwindow-messages">
        {(messages || []).map((msg) => {
          const isMe = msg.from === user?._id;

          return (
            <div
              key={msg._id}
              className={`chat-bubble ${isMe ? "bubble-right" : "bubble-left"}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  className="chat-bubble-image"
                  alt="sent-img"
                />
              ) : (
                <div className="chat-bubble-text">{msg.text}</div>
              )}

              <div className="chat-bubble-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      {/* FOOTER */}
      <div className="chatwindow-footer">
        <div className="emoji-placeholder">🙂</div>

        {/* IMAGE UPLOAD */}
        <label className="chatwindow-upload">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={(e) => handleImageSend(e.target.files[0])}
          />

          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#6932D0"
            stroke="#d0d0d0ff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 
              2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </label>

        <input
          className="chatwindow-input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="chatwindow-sendbtn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
