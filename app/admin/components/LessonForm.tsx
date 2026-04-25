import { useState } from "react";
import type { AdminLesson } from "../create/types";
import { createLesson, updateLesson } from "../create/api";

type Props = {
  editingLesson: AdminLesson | null;
  onCreated: (lesson: AdminLesson) => void;
  onUpdated: () => void;
  onCancelEdit: () => void;
};

export default function LessonForm({
  editingLesson,
  onCreated,
  onUpdated,
  onCancelEdit,
}: Props) {
  const [title, setTitle] = useState(editingLesson?.title ?? "");
  const [description, setDescription] = useState(
    editingLesson?.description ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState(
    editingLesson ? "Editing selected lesson." : "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Lesson title is required.");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingLesson) {
        setMessage("Updating lesson...");
        await updateLesson(editingLesson.id, formData);
        setMessage("Lesson updated successfully.");
        onUpdated();
      } else {
        setMessage("Creating lesson...");
        const createdLesson = await createLesson(formData);
        setMessage("Lesson created successfully.");
        onCreated(createdLesson);
      }

      setTitle("");
      setDescription("");
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold text-indigo-600">Lesson</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          {editingLesson ? "Edit Lesson" : "Create Lesson"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create or update a listening category.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Lesson Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Career English"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Listening practice for workplace conversations"
            rows={5}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Lesson Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:bg-slate-100"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            {editingLesson ? "Update Lesson" : "Create Lesson"}
          </button>

          {editingLesson && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>

        {message && (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
