"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LessonApiDto } from "@/types/api/lesson-api";
import { ArrowLeft } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import SelectLevelBar from "@/components/SelectLevelBar";
import HighlightText from "@/components/HighlightText";
import Fuse from "fuse.js";

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

  // ===== 修改 1：completedExercises 数组 → completedStore 对象 =====
  const [completedStore, setCompletedStore] = useState<Record<string, boolean>>(
    {},
  );

  // ===== 修改 2：exerciseProgressMap 保留为对象，但改成统一 store 语义 =====
  const [progressStore, setProgressStore] = useState<Record<string, number>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

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
    // ===== 修改 3：读取统一 completedStore =====
    const savedCompleted = localStorage.getItem("completedStore");
    const savedProgress = localStorage.getItem("progressStore");

    if (savedCompleted) {
      try {
        const parsed: Record<string, boolean> = JSON.parse(savedCompleted);
        setCompletedStore(parsed);
      } catch {
        setCompletedStore({});
      }
    }

    if (savedProgress) {
      try {
        const parsed: Record<string, number> = JSON.parse(savedProgress);
        setProgressStore(parsed);
      } catch {
        setProgressStore({});
      }
    }
  }, []);

  const availableLevels = useMemo(() => {
    if (!lesson?.exercises) return [];

    const uniqueLevels = Array.from(
      new Set(
        lesson.exercises
          .map((ex) => ex.difficulty)
          .filter((level): level is number => typeof level === "number"),
      ),
    ).sort((a, b) => a - b);

    return uniqueLevels;
  }, [lesson]);

  const filteredExercises = useMemo(() => {
    if (!lesson?.exercises) return [];

    const keyword = searchTerm.trim();

    const searchable = lesson.exercises.map((ex) => {
      // ===== 修改 4：统一 key =====
      const exerciseKey = `${lessonId}_${ex.id}`;

      const isCompleted =
        ex.isCompleted || completedStore[`completed_${exerciseKey}`] === true;

      const savedProgressMs = progressStore[`progress_${exerciseKey}`] ?? 0;
      const isInProgress = !isCompleted && savedProgressMs > 0;

      const statusText = isCompleted
        ? "Completed"
        : isInProgress
          ? "In Progress"
          : "Not Started";

      const difficultyText = difficultyToText(ex.difficulty);

      return {
        ...ex,
        difficultyText,
        statusText,
      };
    });

    if (!keyword) {
      return searchable.filter((ex) => {
        return (
          selectedLevel === "all" ||
          String(ex.difficulty ?? "") === selectedLevel
        );
      });
    }

    const fuse = new Fuse(searchable, {
      threshold: 0.4,
      keys: [
        { name: "title", weight: 0.5 },
        { name: "difficultyText", weight: 0.2 },
        { name: "statusText", weight: 0.2 },
        { name: "transcript", weight: 0.1 },
      ],
    });

    const results = fuse.search(keyword);
    const matched = results.map((r) => r.item);

    return matched.filter((ex) => {
      return (
        selectedLevel === "all" || String(ex.difficulty ?? "") === selectedLevel
      );
    });
  }, [
    lesson,
    lessonId,
    searchTerm,
    selectedLevel,
    completedStore,
    progressStore,
  ]);

  const searchSuggestions = useMemo(() => {
    if (!lesson?.exercises) return [];

    const values = new Set<string>();

    lesson.exercises.forEach((ex) => {
      values.add(ex.title);
      values.add(difficultyToText(ex.difficulty));

      // ===== 修改 5：suggestion 里的状态也改成统一 store =====
      const exerciseKey = `${lessonId}_${ex.id}`;

      const isCompleted =
        ex.isCompleted || completedStore[`completed_${exerciseKey}`] === true;

      const savedProgressMs = progressStore[`progress_${exerciseKey}`] ?? 0;
      const isInProgress = !isCompleted && savedProgressMs > 0;

      values.add(
        isCompleted
          ? "Completed"
          : isInProgress
            ? "In Progress"
            : "Not Started",
      );
    });

    return Array.from(values);
  }, [lesson, lessonId, completedStore, progressStore]);

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          suggestions={searchSuggestions}
        />

        <SelectLevelBar
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          options={availableLevels}
        />
      </div>

      <div className="space-y-4">
        {filteredExercises.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-md">
            No exercises found.
          </div>
        ) : (
          filteredExercises.map((ex, index) => {
            // ===== 修改 6：渲染时也统一使用 store key =====
            const exerciseKey = `${lessonId}_${ex.id}`;

            const isCompleted =
              ex.isCompleted ||
              completedStore[`completed_${exerciseKey}`] === true;

            const savedProgressMs =
              progressStore[`progress_${exerciseKey}`] ?? 0;
            const isInProgress = !isCompleted && savedProgressMs > 0;

            const statusText = isCompleted
              ? "Completed"
              : isInProgress
                ? "In Progress"
                : "Not Started";

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
                        <HighlightText text={ex.title} keyword={searchTerm} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      <HighlightText
                        text={difficultyToText(ex.difficulty)}
                        keyword={searchTerm}
                      />
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
                      <HighlightText text={statusText} keyword={searchTerm} />
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
          })
        )}
      </div>
    </div>
  );
}
