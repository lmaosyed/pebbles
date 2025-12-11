import React, { useState } from "react";
import api from "../../utils/axiosInstance";
import ADMIN from "../../api/adminEndpoints";
import "./adminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(ADMIN.LOGIN, { email, password });
      localStorage.setItem("pebbles_token", res.data.token);
      localStorage.setItem("pebbles_admin", JSON.stringify(res.data.admin));
      window.location.href = "/admin";
    } catch (error) {
      setErr(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-card" onSubmit={submit}>
        <h2>Admin Login</h2>

        <input 
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password"
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="admin-error">{err}</div>}

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
