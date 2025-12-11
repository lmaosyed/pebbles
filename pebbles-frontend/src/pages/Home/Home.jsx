import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useListingStore from "../../store/listingStore";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const listings = useListingStore((s) => s.listings);
  const fetchSearch = useListingStore((s) => s.fetchSearch);

  useEffect(() => {
    fetchSearch(""); // Fetch all listings
  }, [fetchSearch]);

  // Sort newest first
  const newestListings = [...listings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="home-page inside-container">

      {/* ============================
          PURPLE TOP SECTION (60% height)
      ============================= */}
      <div className="home-hero">
        <div className="home-content">

          {/* PEBBLES TITLE */}
          <h1 className="home-title">What are you looking for?</h1>

          {/* SEARCH BAR */}
          <div className="search-bar-container">
            <input
              className="search-input"
              placeholder="Search items, brands or categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/search?q=${encodeURIComponent(search)}`);
                }
              }}
            />
            <button
              className="search-btn"
              onClick={() =>
                navigate(`/search?q=${encodeURIComponent(search)}`)
              }
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ============================
          WHITE STATIC SECTION (40% height)
      ============================= */}
      <div className="home-white-section">

        <h2 className="newest-title">Newest Listings</h2>

        <div className="scroll-row">
          {newestListings.slice(0, 10).map((item) => (
            <div
              key={item._id}
              className="listing-card"
              onClick={() => navigate(`/listing/${item._id}`)}
            >
              <img src={item.images?.[0]} alt={item.title} />
              <h3>{item.title}</h3>
              <p>£{item.price}</p>
            </div>
          ))}
        </div>

        <button
          className="explore-btn-large"
          onClick={() => navigate("/search")}
        >
          Explore
        </button>
      </div>

    </div>
  );
}
