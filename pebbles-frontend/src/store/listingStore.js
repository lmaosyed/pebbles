// src/store/listingStore.js
import { create } from "zustand";
import api from "../utils/axiosInstance";
import ENDPOINTS from "../api/endpoints";

const useListingStore = create((set) => ({
  listings: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,

  fetchNearby: async () => {
    set({ loading: true });
    try {
      const res = await api.get(ENDPOINTS.LISTINGS.NEARBY);
      // adapt to backend response shape if necessary
      set({
        listings: res.data.listings || res.data || [],
        total: res.data.total || 0,
        page: res.data.page || 1,
        pages: res.data.pages || 1,
      });
    } catch (err) {
      console.error("fetchNearby", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchSearch: async (query = "") => {
    set({ loading: true });
    try {
      // backend supports GET /api/listings?search=...
      const res = await api.get("/api/listings", { params: { search: query } });
      set({
        listings: res.data.listings || res.data || [],
        total: res.data.total || 0,
        page: res.data.page || 1,
        pages: res.data.pages || 1,
      });
    } catch (err) {
      console.error("fetchSearch", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchMyListings: async () => {
    set({ loading: true });
    try {
      // call with mine=true param
      const res = await api.get("/api/listings", { params: { mine: true } });
      set({
        listings: res.data.listings || res.data || [],
        total: res.data.total || 0,
        page: res.data.page || 1,
        pages: res.data.pages || 1,
      });
    } catch (err) {
      console.error("fetchMyListings", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchListingById: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(ENDPOINTS.LISTINGS.DETAIL(id));
      // GET /api/listings/:id returns listing object directly per your sample
      set({ loading: false });
      return { success: true, listing: res.data };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

}));

export default useListingStore;
