import { useState } from "react";
import type { AdminLesson } from "../create/types";
import { deleteLesson } from "../create/api";
import HighlightText from "@/components/HighlightText";

type Props = {
  lessons: AdminLesson[];
  selectedLessonId: string;
  onSelect: (lesson: AdminLesson) => void;
  onEdit: (lesson: AdminLesson) => void;
  onDeleted: () => void;
};

export default function LessonList({
  lessons,
  selectedLessonId,
  onSelect,
  onEdit,
  onDeleted,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLessons = lessons.filter((lesson) =>
    `${lesson.title} ${lesson.description ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  async function handleDelete(lesson: AdminLesson) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lesson.title}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteLesson(lesson.id);
      onDeleted();
    } catch (error) {
      console.error(error);
      alert("Failed to delete lesson.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold text-indigo-600">Library</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Lesson List</h2>
        <p className="mt-1 text-sm text-slate-500">
          {lessons.length} lessons in total.
        </p>
      </div>

      <div className="mb-4">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search lessons..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="max-h-130 space-y-3 overflow-y-auto pr-2">
        {filteredLessons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No lessons found.
          </div>
        )}

        {filteredLessons.map((lesson) => {
          const isSelected = lesson.id === selectedLessonId;

          return (
            <div
              key={lesson.id}
              className={`rounded-2xl border p-4 transition ${
                isSelected
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onSelect(lesson)}
                  className="min-w-0 flex-1 text-left"
                >
                  <h3 className="truncate font-semibold text-slate-900">
                    <HighlightText text={lesson.title} keyword={searchTerm} />
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    <HighlightText
                      text={lesson.description || "No description"}
                      keyword={searchTerm}
                    />
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {isSelected && (
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        Selected
                      </span>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {lesson.exercises?.length ?? 0} exercises
                    </span>
                  </div>
                </button>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(lesson)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(lesson)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
