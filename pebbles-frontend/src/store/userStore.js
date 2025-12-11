// src/store/userStore.js
import { create } from "zustand";
import api from "../utils/axiosInstance";
import ENDPOINTS from "../api/endpoints";

const useUserStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("pebbles_token") || null,
  loading: false,

  loadUser: async () => {
    const token = localStorage.getItem("pebbles_token");
    if (!token) {
      set({ user: null, token: null });
      return { success: false, message: "no token" };
    }
    try {
      const res = await api.get(ENDPOINTS.AUTH.ME);
      // backend may return user directly or { user: {...} }
      const payload = res.data.user || res.data;
      set({ user: payload, token });
      return { success: true, user: payload };
    } catch (err) {
      set({ user: null, token: null });
      localStorage.removeItem("pebbles_token");
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      // From your login sample: res.data = { message, token, user: {...} }
      const token = res.data.token;
      const user = res.data.user || null;
      if (token) localStorage.setItem("pebbles_token", token);
      set({ token, user });
      return { success: true, user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const res = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Register failed" };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("pebbles_token");
    set({ user: null, token: null });
  },
}));

export default useUserStore;
