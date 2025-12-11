import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL, // <-- all calls use this base
  withCredentials: true, // only if backend uses cookies; keep if you use JWTs in headers too
});

// attach Authorization header automatically
api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("pebbles_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

export default api;
