"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LessonApiDto } from "@/types/api/lesson-api";

/* ========= UI helper functions ========= */

function difficultyToText(level?: number) {
  switch (level) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
}

function secondsToDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ========= Page ========= */

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonApiDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch(
          `http://localhost:5142/api/lessons/${lessonId}`,
          { cache: "no-store" },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: LessonApiDto = await res.json();
        setLesson(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  /* ========= States ========= */

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!lesson) return null;

  /* ========= Render ========= */

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:text-blue-600"
      >
        ← Back to lessons
      </button>

      {/* Lesson header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>

        {lesson.description && (
          <p className="text-gray-600">{lesson.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{lesson.exercises.length} exercises</span>
          {lesson.rating !== undefined && <span>⭐ {lesson.rating}</span>}
          {lesson.totalDuration && <span>{lesson.totalDuration}</span>}
        </div>

        {lesson.progress !== undefined && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${lesson.progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {lesson.completedExercises ?? 0} / {lesson.exercises.length}{" "}
              completed
            </div>
          </>
        )}
      </div>

      {/* Exercises list */}
      <div className="space-y-4">
        {lesson.exercises.map((ex, index) => {
          const audioSrc = ex.audioUrl ?? ex.audio?.url;

          return (
            <div
              key={ex.id}
              className="border rounded-xl p-4 flex justify-between items-center hover:shadow transition"
            >
              <div className="space-y-1">
                <div className="font-semibold text-lg">
                  {index + 1}. {ex.title}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {difficultyToText(ex.difficulty)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      ex.isCompleted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ex.isCompleted ? "Completed" : "Not Started"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() =>
                    router.push(`/lessons/${lesson.id}/exercises/${ex.id}`)
                  }
                  className={`px-4 py-2 rounded-lg text-sm text-white ${
                    ex.isCompleted ? "bg-green-600" : "bg-blue-600"
                  }`}
                >
                  {ex.isCompleted ? "Completed" : "Start"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
