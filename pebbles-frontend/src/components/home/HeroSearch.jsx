import React from "react";

export default function HeroSearch({ query, setQuery }) {
  const categories = [
    "Furniture",
    "Electronics",
    "Clothes",
    "Books",
    "Kitchen",
    "Tickets",
    "Sports",
  ];

  return (
    <div className="bg-pebbles-primary text-white pb-10">
      <div className="max-w-4xl mx-auto px-4 pt-10">

        {/* Pebbles Brand */}
        <div className="text-3xl font-black drop-shadow">
          Pebbles
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mt-10">
          What are you looking for today?
        </h1>

        {/* Search */}
        <div className="flex justify-center mt-6">
          <div className="bg-white w-full max-w-xl flex items-center gap-3 px-4 py-3 rounded-full shadow-lg">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 text-gray-800 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-500 text-xl">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {categories.map((c) => (
            <button
              key={c}
              className="bg-white text-gray-700 px-4 py-2 rounded-xl shadow"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* White curve divider */}
      <div className="h-8 bg-white rounded-t-[40px] mt-10"></div>
    </div>
  );
}
