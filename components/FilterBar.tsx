"use client";

import { useRef } from "react";
import { X } from "lucide-react";

type FilterBarProps = {
  searchTerm: string;
  selectedLevel: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export default function FilterBar({
  searchTerm,
  selectedLevel,
  selectedCategory,
  onSearchChange,
  onLevelChange,
  onCategoryChange,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-4 items-center">
      {/* 🔍 Search Input */}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSearchChange("");
              inputRef.current?.focus(); // 🔥 ESC 清空后重新 focus
            }
          }}
          placeholder="Search exercises..."
          className="w-full rounded-xl bg-white px-4 py-2 pr-10 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40 focus:shadow-md transition placeholder:text-gray-400"
        />

        {/* ❌ Clear Button */}
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus(); // 🔥 点击 X 后也自动 focus
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Level */}
      <select
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        className="rounded-xl bg-white px-4 py-2 text-gray-700 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40 focus:shadow-md transition"
      >
        <option value="all">All Levels</option>
        <option value="1">Beginner</option>
        <option value="2">Intermediate</option>
        <option value="3">Advanced</option>
      </select>

      {/* Category */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-xl bg-white px-4 py-2 text-gray-700 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40 focus:shadow-md transition"
      >
        <option value="all">All Categories</option>
        <option value="business">Business</option>
        <option value="daily-life">Daily Life</option>
        <option value="academic">Academic</option>
      </select>
    </div>
  );
}
