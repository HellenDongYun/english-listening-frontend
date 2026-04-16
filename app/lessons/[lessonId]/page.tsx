"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LessonApiDto } from "@/types/api/lesson-api";
import { ArrowLeft } from "lucide-react";

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

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonApiDto | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(
    [],
  );
  const [exerciseProgressMap, setExerciseProgressMap] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch(
          `http://localhost:5142/api/lessons/${lessonId}`,
          {
            cache: "no-store",
          },
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

  useEffect(() => {
    const savedCompleted = localStorage.getItem("completedExercises");
    const savedProgress = localStorage.getItem("exerciseProgress");

    if (savedCompleted) {
      try {
        const parsed: string[] = JSON.parse(savedCompleted);
        setCompletedExerciseIds(parsed);
      } catch {
        setCompletedExerciseIds([]);
      }
    }

    if (savedProgress) {
      try {
        const parsed: Record<string, number> = JSON.parse(savedProgress);
        setExerciseProgressMap(parsed);
      } catch {
        setExerciseProgressMap({});
      }
    }
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-md hover:shadow-xl hover:-translate-y-0.5 text-sm text-gray-700 transition"
      >
        <ArrowLeft size={16} />
        Back to Lessons
      </button>

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
      </div>

      <div className="space-y-4">
        {lesson.exercises.map((ex, index) => {
          const isCompleted =
            ex.isCompleted || completedExerciseIds.includes(ex.id);

          const savedProgressMs = exerciseProgressMap[ex.id] ?? 0;
          const isInProgress = !isCompleted && savedProgressMs > 0;

          return (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-slate-900">
                      {ex.title}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {difficultyToText(ex.difficulty)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isInProgress
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isInProgress
                        ? "In Progress"
                        : "Not Started"}
                  </span>
                </div>
              </div>

              <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={() =>
                    router.push(`/lessons/${lesson.id}/exercises/${ex.id}`)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition active:scale-95 ${
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700"
                      : isInProgress
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-gradient-to-r from-[#ff909e] to-[#fad0c4] hover:opacity-90"
                  }`}
                >
                  {isCompleted
                    ? "Completed"
                    : isInProgress
                      ? "Continue"
                      : "Start"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
