import { Lesson } from "@/types/lesson";
import Link from "next/link";
import HighlightText from "@/components/HighlightText";
import Image from "next/image";
import { capitalize, truncate } from "@/utils/text";
type Props = {
  lesson: Lesson;
  searchTerm: string;
};
export default function LessonCard({ lesson, searchTerm }: Props) {
  const desc = lesson.description ?? "";
  const displayDesc = truncate(desc, 60);
  const baseUrl = "http://localhost:5142";
  const imageSrc = lesson.imagePath
    ? `${baseUrl}${lesson.imagePath}`
    : "/default-cover.jpg";

  return (
    <div className="rounded-2xl bg-white p-5 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-200">
      {/* Cover image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={imageSrc || "/default-cover.jpg"}
          alt={lesson.title}
          fill
          unoptimized
          className="object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">
          <HighlightText text={capitalize(lesson.title)} keyword={searchTerm} />
        </h3>

        <p className="text-sm text-gray-600">
          <HighlightText text={capitalize(displayDesc)} keyword={searchTerm} />
        </p>
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center">
          {/* ✅ 关键修复点 */}
          <Link
            href={`/lessons/${lesson.id}`}
            className="bg-linear-to-r from-[#ff909e] to-[#fad0c4] text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            Start →
          </Link>
        </div>
      </div>
    </div>
  );
}
