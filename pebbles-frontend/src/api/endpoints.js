// src/api/endpoints.js
const ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },
  USER: {
    PROFILE: "/api/users/me",
  },
  LISTINGS: {
    NEARBY: "/api/listings/nearby",
    CREATE: "/api/listings",
    DETAIL: (id) => `/api/listings/${id}`,
    UPDATE: (id) => `/api/listings/${id}`,
    DELETE: (id) => `/api/listings/${id}`,
  },
  WISHLIST: {
    GET: "/api/wishlist",
    TOGGLE: (id) => `/api/wishlist/${id}`,
  },
  CHATS: {
    LIST: "/api/chats",
    CREATE: "/api/chats",               // POST { otherUserId, listingId }
    MESSAGES: (chatId) => `/api/chats/${chatId}/messages`,
    SEND: "/api/chats/message",  
    DELETE:(id) => `/api/chats/${id}`,       
  },
  RECENT: { GET: "/api/recent" },
  ADMIN: {
    USERS: "/api/admin/users",
    REPORTS: "/api/admin/reports",
  },
};

export default ENDPOINTS;
