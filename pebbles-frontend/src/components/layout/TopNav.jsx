import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./TopNav.css";
import defaultPfp from "../../assets/defaultpfp.png";
import { Search as SearchIcon } from "lucide-react";

export default function TopNav({ chatCount = 0 }) {
  const navigate = useNavigate();

// STATE
const [searchText, setSearchText] = useState("");

const handleSearch = (e) => {
  e.preventDefault();

  if (!searchText.trim()) {
    navigate("/search");
  } else {
    navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
  }
};


  return (
    <header className="topnav-wrapper">
      <div className="topnav-inner">

        {/* LEFT — LOGO */}
        <div className="topnav-logo" onClick={() => navigate("/")}>
          Pebbles
        </div>

        {/* CENTER — NAV ITEMS */}
        <nav className="topnav-menu">

          <NavLink to="/" className="tn-item" title="Home">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path 
                fill="none" stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                d="M3 11.5L12 3l9 8.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
              />
            </svg>
          </NavLink>

          

          <NavLink to="/chats" className="tn-item chats-item" title="Chats">
            <div className="tn-icon-wrap">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path 
                  fill="none" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>

              {chatCount > 0 && <span className="tn-badge">{chatCount}</span>}
            </div>
          </NavLink>

          

          <button className="tn-sell" onClick={() => navigate("/sell")}>
            +
          </button>
        </nav>

        {/* RIGHT — SETTINGS + AVATAR */}
        {/* RIGHT — SEARCH BAR + AVATAR */}
<div className="topnav-right">

  <form className="topnav-searchbar" onSubmit={handleSearch}>
    <input
      type="text"
      placeholder="Search"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
    <button type="submit" className="search-icon-btn">
      <SearchIcon size={16} />
    </button>
  </form>

  <div
  className="tn-avatar"
  onClick={() => navigate("/profile")}
  style={{ cursor: "pointer" }}
>
  <img src={defaultPfp} alt="avatar" />
</div>

</div>


      </div>
    </header>
  );
}
