import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);
  const loadUser = useUserStore((s) => s.loadUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      await loadUser();
      navigate("/");
      return;
    }
    setErr(res.message || "Login failed");
  };

  return (
    <AuthLayout>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "18px" }}>
        Sign In
      </h2>

      <form className="space-y-4" onSubmit={submit}>
        {err && <div style={{ color: "red", fontSize: "14px" }}>{err}</div>}

        <label>Email</label>
        <input
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="auth-bottom-text">
          Don’t have an account?{" "}
          <Link to="/auth/register">Sign up</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
