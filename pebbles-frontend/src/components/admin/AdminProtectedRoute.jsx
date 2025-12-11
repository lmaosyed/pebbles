import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminProtectedRoute() {
  const token = localStorage.getItem("pebbles_token");
  const admin = JSON.parse(localStorage.getItem("pebbles_admin") || "null");

  if (!token || !admin || admin.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
