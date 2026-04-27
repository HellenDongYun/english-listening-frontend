// lib/mappers/lesson.mapper.ts
import { LessonApiDto } from "@/types/api/lesson-api";
import { Lesson } from "types/lesson";

// function mapDifficulty(level?: number): "Easy" | "Medium" | "Hard" {
//   if (level === 2) return "Medium";
//   if (level === 3) return "Hard";
//   return "Easy";
// }

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

    // ===== 把后端返回的 imagePath 映射过来 =====
    imagePath: api.imagePath ?? undefined,

    // UI 补的
    category: getCategoryFromTitle(api.title),
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

// ===== 根据 title 自动分类category =====
export function getCategoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ted")) return "TED";
  if (t.includes("bbc")) return "BBC";
  if (t.includes("npr")) return "NPR";
  if (t.includes("podcast")) return "Podcast";

  // ===== IELTS =====
  if (t.includes("ielts")) {
    return "ielts";
  }

  // ===== TOEFL =====
  if (t.includes("toefl")) {
    return "toefl";
  }

  // ===== Career / Business =====
  if (
    t.includes("career") ||
    t.includes("job") ||
    t.includes("interview") ||
    t.includes("resume") ||
    t.includes("work") ||
    t.includes("tech") ||
    t.includes("business")
  ) {
    return "career";
  }

  // ===== Academic =====
  if (
    t.includes("academic") ||
    t.includes("lecture") ||
    t.includes("university") ||
    t.includes("study")
  ) {
    return "academic";
  }

  // ===== Daily =====
  if (
    t.includes("daily") ||
    t.includes("conversation") ||
    t.includes("everyday") ||
    t.includes("shopping") ||
    t.includes("travel")
  ) {
    return "daily";
  }
  // ===== 默认 =====
  return "other";
}
