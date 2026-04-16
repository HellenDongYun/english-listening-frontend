export interface LessonExercise {
  id: string;
  title: string;
  transcript: string;
  audioUrl: string;
  difficulty: number;
  durationSeconds: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;

  category: string;
  level: string;
  rating: number;
  duration: string;
  questions: number;
  learners: number;

  exercises: LessonExercise[];
}
