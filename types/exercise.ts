export type ExerciseSubtitleDto = {
  sequence: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export type ExerciseDetailDto = {
  id: string;
  lessonId: string;
  title: string;
  audioUrl: string;
  transcript: string;
  difficulty: number;
  durationSeconds: number;
  subtitles: ExerciseSubtitleDto[];
};
