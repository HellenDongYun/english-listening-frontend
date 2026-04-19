export interface LessonApiDto {
  id: string;
  title: string;
  description: string | null;
  rating?: number;
  totalDuration?: string;
  progress?: number;
  completedExercises?: number;
  exercises: ExerciseApiDto[];
  imagePath?: string | null;
}

export interface ExerciseApiDto {
  id: string;
  title: string;
  lessonId: string;
  transcript: string;
  difficulty?: number;
  durationSeconds?: number;
  audioUrl?: string;
  isCompleted?: boolean;
  progress?: number;

  audio: {
    id: string;
    fileName: string;
    contentType: string;
    size: number;
    url?: string;
  };
}
