// src/pages/Search/SidebarFilters.jsx
import React from "react";
import {
  Sofa,
  Laptop,
  Shirt,
  BookOpen,
  Utensils,
  Ticket,
  Dumbbell,
  XCircle
} from "lucide-react";

export default function SidebarFilters({ onCategorySelect, clearFilters }) {
  const categories = [
    { id: "Furniture", icon: <Sofa size={18} /> },
    { id: "Electronics", icon: <Laptop size={18} /> },
    { id: "Clothes", icon: <Shirt size={18} /> },
    { id: "Books", icon: <BookOpen size={18} /> },
    { id: "Kitchen", icon: <Utensils size={18} /> },
    { id: "Tickets", icon: <Ticket size={18} /> },
    { id: "Sports", icon: <Dumbbell size={18} /> },
  ];

  return (
    <div className="left-sidebar">
      <h3 className="sidebar-title">CATEGORIES</h3>

      <div className="sidebar-section">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="sidebar-category-btn"
            onClick={() => onCategorySelect(cat.id)}
          >
            <div className="cat-left">
              {cat.icon}
              <span>{cat.id}</span>
            </div>
          </button>
        ))}
      </div>

      {/* CLEAR FILTERS */}
      <button className="clear-filters-btn" onClick={clearFilters}>
        <XCircle size={16} />
        Clear Filters
      </button>
    </div>
  );
}
