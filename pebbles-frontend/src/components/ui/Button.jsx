import React from "react";

export default function Button({ children, onClick, type = "button", className = "", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded-xl text-white font-medium shadow-soft disabled:opacity-60 disabled:cursor-not-allowed ${className} `}
    >
      {children}
    </button>
  );
}
