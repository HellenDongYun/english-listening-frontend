import type { AdminLesson } from "../create/types";

export const API_BASE_URL = "http://localhost:5142";

export async function getLessons(): Promise<AdminLesson[]> {
  const response = await fetch(`${API_BASE_URL}/api/lessons`);

  if (!response.ok) {
    throw new Error("Failed to load lessons.");
  }

  return response.json();
}

export async function createLesson(formData: FormData): Promise<AdminLesson> {
  const response = await fetch(`${API_BASE_URL}/api/lessons`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create lesson.");
  }

  return response.json();
}

export async function updateLesson(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update lesson.");
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete lesson.");
  }
}

export async function createExercise(
  lessonId: string,
  formData: FormData,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/lessons/${lessonId}/exercises`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create exercise.");
  }
}

export async function updateExercise(
  lessonId: string,
  exerciseId: string,
  formData: FormData,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/lessons/${lessonId}/exercises/${exerciseId}`,
    {
      method: "PUT",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update exercise.");
  }
}

export async function deleteExercise(
  lessonId: string,
  exerciseId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/lessons/${lessonId}/exercises/${exerciseId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete exercise.");
  }
}
