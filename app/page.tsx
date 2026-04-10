import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import FilterBar from "@/components/FilterBar";
import ExerciseGrid from "@/components/LessonGrid";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <Hero />
      <Stats />
      <FilterBar />
      <ExerciseGrid />
    </main>
  );
}
