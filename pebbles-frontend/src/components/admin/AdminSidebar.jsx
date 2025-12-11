import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiFileText, FiAlertCircle, FiClipboard } from "react-icons/fi";
import "./admin.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("pebbles_token");
    localStorage.removeItem("pebbles_admin");
    navigate("/");
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">Pebbles Admin</div>

      <nav className="admin-nav">
        <NavLink to="/admin" className="admin-nav-item">
          <FiHome /> Dashboard
        </NavLink>

        <NavLink to="/admin/users" className="admin-nav-item">
          <FiUsers /> Users
        </NavLink>

        <NavLink to="/admin/listings" className="admin-nav-item">
          <FiFileText /> Listings
        </NavLink>

        <NavLink to="/admin/reports" className="admin-nav-item">
          <FiAlertCircle /> Reports
        </NavLink>

        <NavLink to="/admin/logs" className="admin-nav-item">
          <FiClipboard /> Logs
        </NavLink>
      </nav>

      <button className="admin-logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
