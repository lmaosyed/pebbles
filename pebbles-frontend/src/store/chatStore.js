import { create } from "zustand";
import ENDPOINTS from "../api/endpoints";
import api from "../utils/axiosInstance";

const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,

  fetchChats: async () => {
    try {
      set({ loading: true });
      const res = await api.get(ENDPOINTS.CHATS.LIST);
      set({ chats: res.data.chats });
    } finally {
      set({ loading: false });
    }
  },

  openChat: async (chatId) => {
    set({ activeChat: chatId, loading: true });
    const res = await api.get(ENDPOINTS.CHATS.MESSAGES(chatId));
    set({ messages: res.data.messages, loading: false });
  },

  
sendMessage: async ({ chatId, text, image }) => {
  try {
    let res;

    // IMAGE MESSAGE
    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("chatId", chatId);

      res = await api.post("/api/chats/send-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

    // TEXT MESSAGE
    } else {
      res = await api.post("/api/chats/send", { chatId, text });
    }

    return res.data;

  } catch (err) {
    console.error("Send message error:", err);
  }
},




  // ⭐ ADDED DELETE FUNCTION ⭐
  deleteChat: async (id) => {
  try {
    console.log("DELETING CHAT:", id);

    await api.delete(ENDPOINTS.CHATS.DELETE(id));

    // refresh chats
    const chatsRes = await api.get(ENDPOINTS.CHATS.LIST);
    set({ chats: chatsRes.data.chats });

  } catch (err) {
    console.error("Delete failed:", err);
  }
},


}));

export default useChatStore;
