import { Lesson } from "@/types/lesson";
import Link from "next/link";

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="border rounded-xl p-5 bg-white flex flex-col justify-between">
      <div className="space-y-2">
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100">
          {lesson.level}
        </span>

        <p className="text-sm text-gray-500">{lesson.category}</p>

        <h3 className="font-semibold text-lg">{lesson.title}</h3>

        <p className="text-sm text-gray-600">{lesson.description}</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>⏱ {lesson.duration}</span>
          <span>{lesson.questions} questions</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">👥 {lesson.learners}</span>

          {/* ✅ 关键修复点 */}
          <Link
            href={`/lessons/${lesson.id}`}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  );
}
