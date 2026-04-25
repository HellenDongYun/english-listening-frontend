"use client";

import { useEffect, useState } from "react";
import type { AdminExercise, AdminLesson } from "../create/types";
import { getLessons } from "./api";
import LessonForm from "../components/LessonForm";
import LessonList from "../components/LessonList";
import ExerciseForm from "../components/ExerciseForm";
import ExerciseList from "../components/ExerciseList";

export default function AdminCreatePage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [editingExercise, setEditingExercise] = useState<AdminExercise | null>(
    null,
  );
  const [loadingMessage, setLoadingMessage] = useState("");

  const selectedLesson =
    lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;

  async function loadLessons() {
    try {
      setLoadingMessage("Loading lessons...");
      const data = await getLessons();
      setLessons(data);

      if (data.length > 0 && !selectedLessonId) {
        setSelectedLessonId(data[0].id);
      }

      setLoadingMessage("");
    } catch (error) {
      console.error(error);
      setLoadingMessage("Failed to load lessons.");
    }
  }

  useEffect(() => {
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLessonCreated(lesson: AdminLesson) {
    setSelectedLessonId(lesson.id);
    setEditingLesson(null);
    loadLessons();
  }

  function handleLessonUpdatedOrDeleted() {
    setEditingLesson(null);
    setEditingExercise(null);
    loadLessons();
  }

  function handleSelectLesson(lesson: AdminLesson) {
    setSelectedLessonId(lesson.id);
    setEditingExercise(null);
  }

  function handleExerciseCreatedUpdatedOrDeleted() {
    setEditingExercise(null);
    loadLessons();
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
              Listening Admin
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
              Content Management
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Manage lessons and exercises without manually typing API URLs.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
            Selected Lesson:{" "}
            <span className="font-semibold text-slate-900">
              {selectedLesson?.title ?? "None"}
            </span>
          </div>
        </div>

        {loadingMessage && (
          <div className="mb-6 rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {loadingMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <LessonForm
            editingLesson={editingLesson}
            onCreated={handleLessonCreated}
            onUpdated={handleLessonUpdatedOrDeleted}
            onCancelEdit={() => setEditingLesson(null)}
          />

          <LessonList
            lessons={lessons}
            selectedLessonId={selectedLessonId}
            onSelect={handleSelectLesson}
            onEdit={setEditingLesson}
            onDeleted={handleLessonUpdatedOrDeleted}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <ExerciseForm
            selectedLesson={selectedLesson}
            editingExercise={editingExercise}
            onCreatedOrUpdated={handleExerciseCreatedUpdatedOrDeleted}
            onCancelEdit={() => setEditingExercise(null)}
          />

          <ExerciseList
            selectedLesson={selectedLesson}
            onEdit={setEditingExercise}
            onDeleted={handleExerciseCreatedUpdatedOrDeleted}
          />
        </div>
      </div>
    </main>
  );
}
