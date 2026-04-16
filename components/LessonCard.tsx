import { Lesson } from "@/types/lesson";
import Link from "next/link";
import HighlightText from "@/components/HighlightText";
type Props = {
  lesson: Lesson;
  searchTerm: string;
};
export default function LessonCard({ lesson, searchTerm }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-200">
      <div className="space-y-2">
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100">
          <HighlightText text={lesson.level} keyword={searchTerm} />
        </span>

        <p className="text-sm text-gray-500">
          <HighlightText text={lesson.category} keyword={searchTerm} />
        </p>

        <h3 className="font-semibold text-lg">
          <HighlightText text={lesson.title} keyword={searchTerm} />
        </h3>

        <p className="text-sm text-gray-600">
          <HighlightText text={lesson.description} keyword={searchTerm} />
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          {/* ✅ 关键修复点 */}
          <Link
            href={`/lessons/${lesson.id}`}
            className="bg-gradient-to-r from-[#ff909e] to-[#fad0c4] text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  );
}
