import { useState } from "react";
import type { AdminExercise, AdminLesson } from "../create/types";
import { deleteExercise } from "../create/api";
import HighlightText from "@/components/HighlightText";

type Props = {
  selectedLesson: AdminLesson | null;
  onEdit: (exercise: AdminExercise) => void;
  onDeleted: () => void;
};

export default function ExerciseList({
  selectedLesson,
  onEdit,
  onDeleted,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const exercises = selectedLesson?.exercises ?? [];

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  async function handleDelete(exercise: AdminExercise) {
    if (!selectedLesson) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${exercise.title}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteExercise(selectedLesson.id, exercise.id);
      onDeleted();
    } catch (error) {
      console.error(error);
      alert("Failed to delete exercise.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold text-emerald-600">Exercises</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Exercise List
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {selectedLesson
            ? `${exercises.length} exercises under ${selectedLesson.title}.`
            : "Select a lesson to view exercises."}
        </p>
      </div>

      {selectedLesson && (
        <div className="mb-4">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      )}

      {!selectedLesson && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No lesson selected.
        </div>
      )}

      {selectedLesson && filteredExercises.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No exercises found.
        </div>
      )}

      <div className="max-h-130 space-y-3 overflow-y-auto pr-2">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">
                  <HighlightText text={exercise.title} keyword={searchTerm} />
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Difficulty: {exercise.difficulty ?? "N/A"}
                </p>
                {exercise.audioUrl && (
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {exercise.audioUrl}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(exercise)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(exercise)}
                  className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
