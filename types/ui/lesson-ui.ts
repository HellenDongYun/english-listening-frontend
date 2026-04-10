// types/ui/lesson-ui.ts

export interface Lesson {
  id: string;
  title: string;
  description: string;

  // UI 层补充的信息
  category: string;
  level: string;
  rating: number;
  duration: string;
  questions: number;
  learners: number;

  exercises: LessonExercise[];
}

export interface LessonExercise {
  id: string;
  title: string;
  transcript: string;

  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;

  isCompleted: boolean;
  progress: number;

  audioUrl?: string;
}
