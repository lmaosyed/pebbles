import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

// ADMIN IMPORTS

// Auth pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Protected pages
import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import Sell from "./pages/Sell/Sell";
import Chats from "./pages/Chat/Chats";
import Profile from "./pages/Profile/Profile";
import ChatWindow from "./pages/Chat/ChatWindow";
import ListingDetails from "./pages/Listing/ListingDetails";
import Settings from "./pages/Settings/Settings";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import useUserStore from "./store/userStore";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogs from "./pages/admin/AdminLogs";


export default function App() {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    const token =
      localStorage.getItem("pebbles_token") || localStorage.getItem("token");
    if (token) loadUser();
  }, []);

  return (
    <div className="app-wrapper">
      <div className="app-fixed">

    
      <div className="min-h-screen bg-pebbles-neutral">
      
      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* SEARCH */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Layout>
                <Search />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* SELL */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Layout>
                <Sell />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* LISTING DETAILS */}
        <Route
          path="/listing/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ListingDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* CHATS LIST */}
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Layout>
                <Chats />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* CHAT WINDOW */}
        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatWindow />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS (WITHOUT LAYOUT ON PURPOSE — YOU CAN WRAP IF YOU WANT) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

<Route element={<AdminProtectedRoute />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="listings" element={<AdminListings />} />
    <Route path="reports" element={<AdminReports />} />
    <Route path="logs" element={<AdminLogs />} />
  </Route>
</Route>
</Routes>

    </div>
    </div>
    </div>


  );
}
