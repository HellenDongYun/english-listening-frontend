// lib/mappers/lesson.mapper.ts
import { LessonApiDto } from "@/types/api/lesson-api";
import { Lesson } from "types/lesson";

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

    // ===== 修改 1：把后端返回的 imagePath 映射过来 =====
    imagePath: api.imagePath ?? undefined,

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
      audioUrl: ex.audioUrl ?? ex.audio?.url ?? "",

      // 关键修改：给默认值
      difficulty: ex.difficulty ?? 1,
      durationSeconds: ex.durationSeconds ?? 0,

      duration: formatDuration(ex.durationSeconds ?? 0),
      isCompleted: false,
      progress: 0,
    })),
  };
}
