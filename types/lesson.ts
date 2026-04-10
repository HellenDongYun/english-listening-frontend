export interface Lesson {
  id: string;
  title: string;
  description: string;

  // 下面这些是「前端 UI 补出来的」
  category: string;
  level: string;
  rating: number;
  duration: string;
  questions: number;
  learners: number;
}
