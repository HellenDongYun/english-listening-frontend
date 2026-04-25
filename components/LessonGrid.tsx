import { useEffect, useMemo, useRef, useState } from "react";
import LessonCard from "./LessonCard";
import { Lesson } from "@/types/lesson";
import { LessonApiDto } from "@/types/api/lesson-api";
import { mapLessonApiToLesson } from "@/mapper/lessonMapper";

type ExerciseGridProps = {
  searchTerm: string;
  selectedLevel: string;
  selectedCategory: string;
  setSuggestions: (values: string[]) => void;
};

export default function LessonGrid({
  searchTerm,
  selectedLevel,
  selectedCategory,
  setSuggestions,
}: ExerciseGridProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== 分页 state =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ===== 新增列表顶部 ref，用来滚动定位 =====
  const listTopRef = useRef<HTMLDivElement>(null);

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

  const suggestions = useMemo(() => {
    const set = new Set<string>();

    lessons.forEach((lesson) => {
      set.add(lesson.title);

      if (lesson.description) {
        lesson.description
          .split(" ")
          .slice(0, 20)
          .forEach((w) => w.length > 3 && set.add(w));
      }
    });

    return Array.from(set);
  }, [lessons]);

  useEffect(() => {
    setSuggestions(suggestions);
  }, [suggestions, setSuggestions]);

  const filteredLessons = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return lessons
      .map((lesson) => {
        const title = lesson.title?.toLowerCase() ?? "";
        const desc = lesson.description?.toLowerCase() ?? "";
        const shortDesc = desc.slice(0, 100);

        let score = 0;

        if (!keyword) return { lesson, score: 0 };

        if (title.includes(keyword)) score += 5;
        if (shortDesc.includes(keyword)) score += 2;

        return { lesson, score };
      })
      .filter((item) => {
        const matchesSearch = !keyword || item.score > 0;

        const matchesLevel =
          selectedLevel === "all" ||
          item.lesson.exercises.some(
            (exercise) => String(exercise.difficulty) === selectedLevel,
          );

        const matchesCategory =
          selectedCategory === "all" ||
          item.lesson.category?.toLowerCase() ===
            selectedCategory.toLowerCase();

        return matchesSearch && matchesLevel && matchesCategory;
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.lesson);
  }, [lessons, searchTerm, selectedLevel, selectedCategory]);

  // ===== 筛选变化时重置回第一页 =====
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedCategory]);

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);

  const paginatedLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLessons.slice(startIndex, endIndex);
  }, [filteredLessons, currentPage]);

  // ===== 切页时自动滚动到列表顶部 =====
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    // 等状态更新后滚动，体验更稳
    requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const startItem =
    filteredLessons.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredLessons.length);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis-right", totalPages] as const;
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis-left",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ] as const;
  }, [currentPage, totalPages]);

  if (loading)
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  if (filteredLessons.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-gray-500">No lessons found 😢</p>
        <p className="mt-2 text-sm text-gray-400">Try a different keyword</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== 给列表顶部加 ref，作为滚动目标 ===== */}
      <div ref={listTopRef} />

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Showing <span className="font-medium text-gray-700">{startItem}</span>
          {"–"}
          <span className="font-medium text-gray-700">{endItem}</span> of{" "}
          <span className="font-medium text-gray-700">
            {filteredLessons.length}
          </span>{" "}
          lessons
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {paginatedLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} searchTerm={searchTerm} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          {visiblePages.map((page, index) => {
            if (page === "ellipsis-left" || page === "ellipsis-right") {
              return (
                <span
                  key={`${page}-${index}`}
                  className="px-2 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`rounded-lg px-4 py-2 text-sm shadow-sm transition ${
                  isActive
                    ? "bg-linear-to-r from-[#ff909e] to-[#fad0c4] text-gray-800"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
