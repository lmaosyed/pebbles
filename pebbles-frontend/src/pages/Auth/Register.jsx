import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const register = useUserStore((s) => s.register);
  const login = useUserStore((s) => s.login);
  const loadUser = useUserStore((s) => s.loadUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.id]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await register(form);

    if (!res.success) {
      setErr(res.message || "Registration failed");
      setLoading(false);
      return;
    }

    await login(form.email, form.password);
    await loadUser();
    navigate("/");
  };

  return (
    <AuthLayout>
      <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "18px" }}>
        Sign Up
      </h2>

      <form className="space-y-4" onSubmit={submit}>
        {err && <div style={{ color: "red", fontSize: "14px" }}>{err}</div>}

        <label>Your Name</label>
        <input
          id="name"
          className="auth-input"
          value={form.name}
          onChange={onChange}
        />

        <label>Email</label>
        <input
          id="email"
          className="auth-input"
          value={form.email}
          onChange={onChange}
        />

        <label>Password</label>
        <input
          id="password"
          type="password"
          className="auth-input"
          value={form.password}
          onChange={onChange}
        />

        <button className="auth-btn" disabled={loading}>
          {loading ? "Creating…" : "Sign Up"}
        </button>

        <div className="auth-bottom-text">
          Already have an account?{" "}
          <Link to="/auth/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
