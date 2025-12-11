// src/components/layout/TopHeader.jsx
import React from "react";
import "./TopHeader.css";

export default function TopHeader({ title = "Pebbles" }) {
  return (
    <header className="peb-topheader">
  <div className="peb-title">Pebbles</div>
</header>

  );
}
