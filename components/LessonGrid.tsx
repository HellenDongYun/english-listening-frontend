"use client";

import { useEffect, useState } from "react";
import LessonCard from "./LessonCard";
import { Lesson } from "@/types/lesson";
import { LessonApiDto } from "@/types/api/lesson-api";
import { mapLessonApiToLesson } from "@/mapper/lessonMapper";

export default function LessonGrid() {
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

  if (loading) return <p>Loading lessons...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
