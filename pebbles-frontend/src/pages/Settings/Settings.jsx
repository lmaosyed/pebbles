import React, { useState, useEffect } from "react";
import useUserStore from "../../store/userStore";
import api from "../../utils/axiosInstance";
import "./Settings.css";

export default function Settings() {
  const { user, loadUser, logout } = useUserStore();

  // Toast Component
  const Toast = ({ message, type }) => (
    <div className={`toast-popup ${type}`}>
      {message}
    </div>
  );

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // Local form states
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Load values when user is ready
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  // Save profile
  const handleSave = async () => {
    try {
      await api.patch("/api/users/me", { fullName });

      showToast("Profile updated!", "success");
      loadUser();
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      return showToast("Enter both passwords", "error");
    }

    try {
      await api.patch("/api/users/me", {
        currentPassword,
        newPassword,
      });

      showToast("Password updated!", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Password change failed",
        "error"
      );
    }
  };

  return (
    <div className="settings-page">

      {/* TOAST */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <h1 className="settings-title">Settings</h1>

      <div className="settings-card">
        <h2>Profile</h2>

        <div className="settings-profile">
          <div className="settings-field">
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label>Email</label>
            <input value={user.email} disabled />
          </div>

          <button onClick={handleSave} className="settings-btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h2>Change Password</h2>

        <div className="settings-field">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="settings-field">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button
          className="settings-btn-primary"
          onClick={handlePasswordChange}
        >
          Update Password
        </button>
      </div>

      
      
    </div>
  );
}
