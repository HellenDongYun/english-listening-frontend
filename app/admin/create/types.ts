export type AdminExercise = {
  id: string;
  lessonId: string;
  title: string;
  audioUrl?: string;
  transcript?: string;
  difficulty?: number;
};

export type AdminLesson = {
  id: string;
  title: string;
  description?: string;
  imagePath?: string;
  imageUrl?: string;
  exercises?: AdminExercise[];
};
