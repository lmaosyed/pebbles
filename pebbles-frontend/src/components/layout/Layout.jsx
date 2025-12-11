// src/components/layout/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import "./Layout.css";
import TopNav from "./TopNav";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // Hide header on home page "/"
  const hideHeader = pathname === "/" ;


  return (
    <div className="peb-app">
      <TopNav />

      <div className="peb-main">
        {!hideHeader }

        {/* FIXED: main tag + correct class */}
        <main className="peb-content">
          {children}
        </main>
      </div>
    </div>
  );
}
