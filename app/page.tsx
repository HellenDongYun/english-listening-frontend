"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import FilterBar from "@/components/FilterBar";
import ExerciseGrid from "@/components/LessonGrid";
import SelectCategoryBar from "@/components/SelectCategoryBar";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const selectedLevel = "all";
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <Hero />
      <Stats />
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search lessons..."
          suggestions={suggestions}
        />
        <SelectCategoryBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
      <ExerciseGrid
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        setSuggestions={setSuggestions}
      />
    </main>
  );
}
