import React from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

export default function ProtectedRoute({ children }) {
  const token = useUserStore((s) => s.token);

  if (!token) return <Navigate to="/auth/login" />;

  return children;
}
