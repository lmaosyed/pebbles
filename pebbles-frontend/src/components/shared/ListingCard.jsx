import React from "react";

export default function ListingCard({ item = {}, onClick, onToggleWishlist }) {
  // item: { id, title, price, image, badge, timeAgo, liked }
  return (
    <div
      role="button"
      onClick={() => onClick?.(item)}
      className="bg-white rounded-xl overflow-hidden shadow-soft border border-transparent hover:shadow-lg transition-shadow"
    >
      <div className="h-40 w-full bg-gray-100 overflow-hidden rounded-t-xl">
        <img
          src={item.image || "/assets/placeholder-rect.png"}
          alt={item.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.timeAgo}</p>
          </div>
          <div className="text-sm font-bold text-purple-700 ml-2">£{item.price}</div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-green-600 font-medium">{item.badge}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(item.id); }}
            className="ml-2 text-sm"
            aria-label="toggle wishlist"
          >
            <span className={`text-lg ${item.liked ? "text-red-500" : "text-gray-400"}`}>♥</span>
          </button>
        </div>
      </div>
    </div>
  );
}
