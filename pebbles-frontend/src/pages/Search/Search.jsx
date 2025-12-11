import useUserStore from "../../store/userStore";
import React, { useEffect, useState } from "react";
import useListingStore from "../../store/listingStore";
import SidebarFilters from "./SidebarFilters";
import "./Search.css";
import { useSearchParams } from "react-router-dom";

export default function Search() {
  const listings = useListingStore((s) => s.listings);
  const fetchSearch = useListingStore((s) => s.fetchSearch);
  const loading = useListingStore((s) => s.loading);
  const user = useUserStore((s) => s.user);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
const [params] = useSearchParams();
const queryFromUrl = params.get("q") || "";
 

useEffect(() => {
  const q = queryFromUrl.trim();

  if (q) {
    setQuery(q);
    fetchSearch(q);
  } else {
    fetchSearch(""); // load all listings if empty search
  }
}, [queryFromUrl]);


  const applyCategory = (cat) => {
    setActiveCategory(cat);
    fetchSearch(cat);
  };

  const clearFilters = () => {
    setActiveCategory("");
    setQuery("");
    fetchSearch("");
  };

  const applySearch = (e) => {
    e.preventDefault();
    fetchSearch(query);
  };

  const filteredListings = listings?.filter((item) => {
    const sellerId =
      typeof item.seller === "string" ? item.seller : item.seller?._id;
    return sellerId !== user?._id;
  });

  return (
    <div className="search-layout">

      {/* LEFT SIDEBAR */}
      <SidebarFilters
        onCategorySelect={applyCategory}
        clearFilters={clearFilters}
      />

      {/* RIGHT SIDE */}
      <div className="search-content">
      <h2 className="search-title">All Listings</h2>
        {/* SEARCH BAR */}
        <form className="search-bar" onSubmit={applySearch}>
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for items..."
          />
          <button className="search-btn">Search</button>
        </form>

        {/* LISTINGS */}
        <div className="search-grid">
          {loading ? (
            <div className="empty">Loading...</div>
          ) : filteredListings?.length ? (
            filteredListings.map((item) => (
              <div
                key={item._id}
                className="search-card"
                onClick={() => (window.location.href = `/listing/${item._id}`)}
              >
                <img
                  src={item.images?.[0] || "/placeholder-rect.png"}
                  className="card-img"
                />
                <div className="card-info">
                  <h3>{item.title}</h3>
                  <p>£{item.price}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">No results</div>
          )}
        </div>

      </div>
    </div>
  );
}
