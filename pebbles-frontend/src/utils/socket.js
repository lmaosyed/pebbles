import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem("pebbles_token")
  }
});

export default socket;
