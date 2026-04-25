import { useState } from "react";
import type { AdminExercise, AdminLesson } from "../create/types";
import { createExercise, updateExercise } from "../create/api";

type Props = {
  selectedLesson: AdminLesson | null;
  editingExercise: AdminExercise | null;
  onCreatedOrUpdated: () => void;
  onCancelEdit: () => void;
};

export default function ExerciseForm({
  selectedLesson,
  editingExercise,
  onCreatedOrUpdated,
  onCancelEdit,
}: Props) {
  const [title, setTitle] = useState(editingExercise?.title ?? "");
  const [difficulty, setDifficulty] = useState(
    String(editingExercise?.difficulty ?? 1),
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [message, setMessage] = useState(
    editingExercise ? "Editing selected exercise." : "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedLesson) {
      setMessage("Please select a lesson first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Exercise title is required.");
      return;
    }

    if (!editingExercise && !audioFile) {
      setMessage("Audio file is required.");
      return;
    }

    if (!editingExercise && !subtitleFile) {
      setMessage("Subtitle file is required.");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Difficulty", difficulty);

    if (audioFile) {
      formData.append("AudioFile", audioFile);
    }

    if (subtitleFile) {
      formData.append("SubtitleFile", subtitleFile);
    }

    try {
      if (editingExercise) {
        setMessage("Updating exercise...");
        await updateExercise(selectedLesson.id, editingExercise.id, formData);
        setMessage("Exercise updated successfully.");
      } else {
        setMessage("Creating exercise...");
        await createExercise(selectedLesson.id, formData);
        setMessage("Exercise created successfully.");
      }

      setTitle("");
      setDifficulty("1");
      setAudioFile(null);
      setSubtitleFile(null);
      onCreatedOrUpdated();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">Exercise</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {editingExercise ? "Edit Exercise" : "Create Exercise"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedLesson
              ? `Selected lesson: ${selectedLesson.title}`
              : "Please select a lesson first."}
          </p>
        </div>

        {editingExercise && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Exercise Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Podcast listening practice 1"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          >
            <option value="1">Beginner</option>
            <option value="2">Intermediate</option>
            <option value="3">Advanced</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Audio File
          </label>
          <input
            type="file"
            accept=".m4a,.mp3,audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-slate-100"
          />
          {editingExercise && (
            <p className="mt-2 text-xs text-slate-500">
              Leave empty if you do not want to replace the current audio.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Subtitle File
          </label>
          <input
            type="file"
            accept=".srt"
            onChange={(e) => setSubtitleFile(e.target.files?.[0] ?? null)}
            className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-slate-100"
          />
          {editingExercise && (
            <p className="mt-2 text-xs text-slate-500">
              Leave empty if you do not want to replace the current subtitle.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={!selectedLesson}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {editingExercise ? "Update Exercise" : "Create Exercise"}
          </button>

          {message && (
            <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
