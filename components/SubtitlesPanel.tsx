import { Bookmark } from "lucide-react";
import type { Subtitle } from "@/types/subtitle";

type BookmarkItem = {
  text: string;
  startMs: number;
};

type SubtitlesPanelProps = {
  subtitles: Subtitle[];
  activeIndex: number;
  seekTo: (startMs: number) => void;
  bookmarks: BookmarkItem[];
  toggleBookmark: (subtitle: Subtitle) => void;
};

export default function SubtitlesPanel({
  subtitles,
  activeIndex,
  seekTo,
  bookmarks,
  toggleBookmark,
}: SubtitlesPanelProps) {
  return (
    <div className="space-y-3 rounded-xl border bg-white p-6 dark:bg-gray-800">
      <h3 className="mb-2 font-medium">Subtitles</h3>

      {subtitles.map((s, i) => {
        const active = i === activeIndex;
        const isBookmarked = bookmarks.find((b) => b.startMs === s.startMs);

        return (
          <div
            key={i}
            onClick={() => seekTo(s.startMs)}
            className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-4 ${
              active
                ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
          >
            <p className="text-sm leading-6">{s.text}</p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(s);
              }}
              className="shrink-0"
              aria-label="Toggle bookmark"
            >
              <Bookmark
                size={16}
                className={isBookmarked ? "fill-current" : ""}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
