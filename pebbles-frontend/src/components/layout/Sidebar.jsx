// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { Search as SearchIcon } from "lucide-react";
import defaultPfp from "../../assets/defaultpfp.png";

export default function Sidebar({ chatCount = 0, wishlistCount = 0 }) {
  const navigate = useNavigate();

  return (
    <aside className="peb-sidebar" aria-label="Main navigation">
      <div className="sb-inner">

        <div className="sb-top"></div>

        {/* HOME */}
        <NavLink to="/" className="sb-item" title="Home">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"
              d="M3 11.5L12 3l9 8.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
          </svg>
        </NavLink>

        {/* SEARCH (with proper spacing) */}
        <NavLink to="/search" className="sb-item" title="Search">
          <SearchIcon size={22} />
        </NavLink>

        {/* CHATS */}
        <NavLink to="/chats" className="sb-item" title="Chats">
          <div className="icon-wrap">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {chatCount > 0 && <span className="sb-badge">{chatCount}</span>}
          </div>
        </NavLink>

        {/* PROFILE */}
        <NavLink to="/profile" className="sb-item" title="Profile">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path fill="none" stroke="currentColor" strokeWidth="1.6"
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </NavLink>

        {/* SELL BUTTON */}
        <button className="sb-item sb-sell" title="Sell" onClick={() => navigate("/sell")}>
          <div className="sell-plus">+</div>
        </button>

        

        <div className="sb-spacer" />

        {/* SETTINGS */}
        <NavLink to="/settings" className="sb-item" title="Settings">
          <div className="sidebar-icon">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="26" 
    height="26" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.76.3 1.34.94 1.51 1.74V12c-.17.8-.75 1.44-1.51 1.74z"></path>
  </svg>
</div>

        </NavLink>

        {/* AVATAR */}
        <div className="sb-avatar">
          <img src={defaultPfp} alt="pfp" className="sidebar-avatar" />

        </div>

      </div>
    </aside>
  );
}
