"use client";

type SelectCategoryBarProps = {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
};

export default function SelectCategoryBar({
  selectedCategory,
  onCategoryChange,
}: SelectCategoryBarProps) {
  return (
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
  );
}
