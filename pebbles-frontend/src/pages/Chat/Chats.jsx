import React, { useEffect } from "react";
import "./Chats.css";
import { useNavigate } from "react-router-dom";
import useChatStore from "../../store/chatStore";

export default function Chats() {
  const navigate = useNavigate();

  const fetchChats = useChatStore((s) => s.fetchChats);
  const chats = useChatStore((s) => s.chats);
  const deleteChatFn = useChatStore((s) => s.deleteChat);

  const [showPopup, setShowPopup] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState(null);

  const confirmDelete = (id) => {
    setChatToDelete(id);
    setShowPopup(true);
  };

  const handleDelete = async () => {
    await deleteChatFn(chatToDelete);
    setShowPopup(false);
    fetchChats();
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const openChat = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="chat-page-container">
      <div className="chat-list-header">
        <h2>Chats</h2>
      </div>

      <div className="chat-list-container">
        {Array.isArray(chats) && chats.length > 0 ? (
          chats.map((chatObj, index) => {
            const me = useChatStore.getState().user?._id;

            const chat = chatObj.chat ?? chatObj;

            const other =
              chatObj.otherUser ??
              chat.participants?.find((p) => p._id !== me);

            const lastMsg = chatObj.lastMessage?.text ?? "No messages yet";

            return (
              <div key={chat._id || index} className="chat-row">

                {/* LEFT CLICKABLE SIDE */}
                <div
                  className="chat-row-left"
                  onClick={() => openChat(chat._id)}
                >
                  <div className="chat-avatar">
                    {other?.profileImage ? (
                      <img src={other.profileImage} alt="" />
                    ) : (
                      <div className="chat-avatar-placeholder">
                        {other?.fullName?.[0] || "U"}
                      </div>
                    )}
                  </div>

                  <div className="chat-info">
                    <div className="chat-name">{other?.fullName}</div>
                    <div className="chat-lastmsg">{lastMsg}</div>
                  </div>
                </div>

                {/* DELETE BUTTON — USING MODAL */}
                <button
  className="delete-chat-btn"
  onClick={(e) => {
    e.stopPropagation();
    confirmDelete(chat._id);
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />       {/* Top bar */}
    <path d="M19 6l-1 14H6L5 6" />             {/* Bin body */}
    <path d="M10 11v6" />                     {/* Left line */}
    <path d="M14 11v6" />                     {/* Right line */}
    <path d="M9 6V3h6v3" />                    {/* Lid */}
  </svg>
</button>


                {/* unread badge */}
                {chatObj.unread > 0 && (
                  <span className="chat-unread-badge">{chatObj.unread}</span>
                )}
              </div>
            );
          })
        ) : (
          <div className="chat-empty">No chats yet</div>
        )}
      </div>

      {/* DELETE POPUP */}
      {showPopup && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <h3>Delete Chat?</h3>
            <p>This action cannot be undone.</p>

            <div className="popup-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>

              <button className="delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
