import React from "react";
import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrapper">

      {/* LEFT SECTION */}
      <div className="auth-left">
        <div className="auth-overlay"></div>

        <div className="auth-content">
          <h1 className="auth-title">Pebbles</h1>
          <p className="auth-subtitle">Made by students,<br />for students.</p>

          <div className="auth-points">
            <div className="point">
              <span className="tick">✔</span>
              Exclusive to students only
            </div>

            <div className="point">
              <span className="tick">✔</span>
              Zero hassle, zero scam with exchanges on campus
            </div>

            <div className="point">
              <span className="tick">✔</span>
              Exclusive to students only
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="auth-right">
        <div className="auth-card">{children}</div>
      </div>

    </div>
  );
}
