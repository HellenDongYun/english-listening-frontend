"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "./LessonCard";
import { Lesson } from "@/types/lesson";
import { LessonApiDto } from "@/types/api/lesson-api";
import { mapLessonApiToLesson } from "@/mapper/lessonMapper";
import Fuse from "fuse.js";
type ExerciseGridProps = {
  searchTerm: string;
  selectedLevel: string;
  selectedCategory: string;
};

export default function LessonGrid({
  searchTerm,
  selectedLevel,
  selectedCategory,
}: ExerciseGridProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      try {
        const res = await fetch("http://localhost:5142/api/lessons");
        const data: LessonApiDto[] = await res.json();

        const mapped = data.map(mapLessonApiToLesson);
        setLessons(mapped);
      } catch (err) {
        console.error("Failed to load lessons", err);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  const filteredLessons = useMemo(() => {
    if (!lessons.length) return [];

    if (!searchTerm.trim()) return lessons;

    const data = lessons.map((lesson) => ({
      ...lesson,
      shortDesc: lesson.description?.slice(0, 100) ?? "",
    }));

    const fuse = new Fuse(data, {
      threshold: 0.4,
      keys: [
        { name: "title", weight: 0.7 }, // ⭐重点
        { name: "shortDesc", weight: 0.3 },
      ],
    });

    return fuse.search(searchTerm).map((r) => r.item);
  }, [lessons, searchTerm]);

  if (loading) return <p>Loading lessons...</p>;

  if (filteredLessons.length === 0) {
    return <p>No lessons found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredLessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} searchTerm={searchTerm} />
      ))}
    </div>
  );
}
