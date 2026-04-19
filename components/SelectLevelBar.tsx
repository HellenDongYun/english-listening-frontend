"use client";

type SelectLevelBarProps = {
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  options?: number[];
};
function difficultyToText(level?: number) {
  switch (level) {
    case 1:
      return "Beginner";
    case 2:
      return "Intermediate";
    case 3:
      return "Advanced";
    default:
      return "Unknown";
  }
}

export default function SelectLevelBar({
  selectedLevel,
  onLevelChange,
  options = [1, 2, 3],
}: SelectLevelBarProps) {
  return (
    <select
      value={selectedLevel}
      onChange={(e) => onLevelChange(e.target.value)}
      className="rounded-xl bg-white px-4 py-2 text-gray-700 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40 focus:shadow-md transition"
    >
      <option value="all">All Levels</option>
      {options.map((level) => (
        <option key={level} value={String(level)}>
          {difficultyToText(level)}
        </option>
      ))}
    </select>
  );
}
