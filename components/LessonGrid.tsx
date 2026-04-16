"use client";

import { useEffect, useMemo, useState } from "react";
import LessonCard from "./LessonCard";
import { Lesson } from "@/types/lesson";
import { LessonApiDto } from "@/types/api/lesson-api";
import { mapLessonApiToLesson } from "@/mapper/lessonMapper";

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
    const keyword = searchTerm.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const lessonTitle = lesson.title?.toLowerCase() ?? "";

      const exercises = Array.isArray(lesson.exercises) ? lesson.exercises : [];

      const matchesSearch =
        !keyword ||
        lessonTitle.includes(keyword) ||
        exercises.some(
          (exercise) =>
            exercise.title?.toLowerCase().includes(keyword) ||
            exercise.transcript?.toLowerCase().includes(keyword),
        );

      const matchesLevel =
        selectedLevel === "all" ||
        exercises.some(
          (exercise) => String(exercise.difficulty) === selectedLevel,
        );

      // 当前后端如果没有 category 字段，这里只能先放行
      const matchesCategory =
        selectedCategory === "all" ||
        exercises.some(
          (exercise) =>
            "category" in exercise &&
            typeof exercise.category === "string" &&
            exercise.category.toLowerCase() === selectedCategory.toLowerCase(),
        );

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [lessons, searchTerm, selectedLevel, selectedCategory]);

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
