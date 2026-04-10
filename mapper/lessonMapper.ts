// lib/mappers/lesson.mapper.ts
import { LessonApiDto } from "@/types/api/lesson-api";
import { Lesson } from "types/ui/lesson-ui";

function mapDifficulty(level?: number): "Easy" | "Medium" | "Hard" {
  if (level === 2) return "Medium";
  if (level === 3) return "Hard";
  return "Easy";
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function mapLessonApiToLesson(api: LessonApiDto): Lesson {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",

    // UI 补的
    category: "Conversation",
    level: "Beginner",
    rating: 4.8,
    duration: `${api.exercises.length * 5} min`,
    questions: api.exercises.length,
    learners: 1200,

    exercises: api.exercises.map((ex) => ({
      id: ex.id,
      title: ex.title,
      transcript: ex.transcript,
      difficulty: mapDifficulty(ex.difficulty),
      duration: formatDuration(ex.durationSeconds),
      isCompleted: false,
      progress: 0,
      audioUrl: ex.audioUrl ?? ex.audio?.url,
    })),
  };
}
