"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import FilterBar from "@/components/FilterBar";
import ExerciseGrid from "@/components/LessonGrid";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <Hero />
      <Stats />

      <FilterBar
        searchTerm={searchTerm}
        selectedLevel={selectedLevel}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchTerm}
        onLevelChange={setSelectedLevel}
        onCategoryChange={setSelectedCategory}
      />

      <ExerciseGrid
        searchTerm={searchTerm}
        selectedLevel={selectedLevel}
        selectedCategory={selectedCategory}
      />
    </main>
  );
}
