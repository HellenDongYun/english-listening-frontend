import type { ExerciseDetailDto } from "@/types/exercise";
import type { Subtitle } from "@/types/subtitle";

export function mapExerciseSubtitles(exercise: ExerciseDetailDto): Subtitle[] {
  return (exercise.subtitles || []).map((item) => ({
    startMs: Math.round(item.startSeconds * 1000),
    endMs: Math.round(item.endSeconds * 1000),
    text: item.text,
  }));
}
