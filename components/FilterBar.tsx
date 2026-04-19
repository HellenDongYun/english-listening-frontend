"use client";

import { useRef, useState, useMemo } from "react";
import { X, Search } from "lucide-react";

type FilterBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  // ===== 传入 suggestions 数据 =====
  suggestions?: string[];
};

export default function FilterBar({
  searchTerm,
  onSearchChange,
  suggestions = [],
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ===== 自动过滤建议 =====
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return [];

    const keyword = searchTerm.toLowerCase();

    return suggestions
      .filter((s) => s.toLowerCase().includes(keyword))
      .slice(0, 5);
  }, [searchTerm, suggestions]);

  return (
    <div className="relative flex-1">
      {/* ===== 输入框 ===== */}
      <div className="relative">
        {/* 🔍 icon */}
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          ref={inputRef}
          value={searchTerm}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search exercises..."
          className="w-full rounded-xl bg-white pl-9 pr-10 py-2 shadow-sm 
          hover:shadow-md 
          focus:outline-none 
          focus:ring-2 focus:ring-[#ff909e]/40 
          focus:shadow-md 
          transition placeholder:text-gray-400"
        />

        {/* ❌ clear */}
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ===== 下拉建议 ===== */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
          {filteredSuggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                onSearchChange(item);
                setShowSuggestions(false);
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
