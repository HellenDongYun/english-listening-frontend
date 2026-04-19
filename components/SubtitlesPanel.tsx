"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import type { Subtitle } from "@/types/subtitle";
import HighlightText from "@/components/HighlightText";
type SubtitlesPanelProps = {
  subtitles: Subtitle[];
  activeIndex: number;
  seekTo: (startMs: number) => void;
  bookmarks: Subtitle[];
  toggleBookmark: (subtitle: Subtitle) => void;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SubtitlesPanel({
  subtitles,
  activeIndex,
  seekTo,
  bookmarks,
  toggleBookmark,
}: SubtitlesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const bookmarkSet = useMemo(() => {
    return new Set(bookmarks.map((b) => b.startMs));
  }, [bookmarks]);

  const filteredSubtitles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return subtitles;
    return subtitles.filter((s) => s.text.toLowerCase().includes(keyword));
  }, [subtitles, searchTerm]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, filteredSubtitles]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md transition">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Subtitles</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {filteredSubtitles.length} / {subtitles.length}
        </span>
      </div>

      {/* search */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subtitles..."
          className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff909e]/30"
        />
      </div>

      {/* list */}
      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-2">
        {filteredSubtitles.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 shadow-sm">
            No subtitles matched your search.
          </div>
        ) : (
          filteredSubtitles.map((s, i) => {
            const originalIndex = subtitles.findIndex(
              (item) => item.startMs === s.startMs && item.endMs === s.endMs,
            );

            const active = originalIndex === activeIndex;
            const isBookmarked = bookmarkSet.has(s.startMs);

            return (
              <div
                key={`${s.startMs}-${i}`}
                ref={active ? activeItemRef : null}
                onClick={() => seekTo(s.startMs)}
                className={`cursor-pointer rounded-xl p-3 transition ${
                  active
                    ? "relative bg-gradient-to-r from-[#ff909e]/20 to-[#fad0c4]/20 text-slate-900 shadow-md before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#ff909e] before:rounded-l-xl"
                    : "bg-slate-50 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {/* time */}
                    <span
                      className={`mt-0.5 w-12 shrink-0 text-xs font-semibold ${
                        active ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {formatTime(s.startMs)}
                    </span>

                    {/* text */}
                    <p className="min-w-0 text-sm leading-6 break-words">
                      <HighlightText text={s.text} keyword={searchTerm} />
                    </p>
                  </div>

                  {/* bookmark */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(s);
                    }}
                    className={`shrink-0 rounded-lg p-2 transition ${
                      isBookmarked
                        ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                        : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    }`}
                  >
                    <Bookmark
                      size={16}
                      className={`transition ${isBookmarked ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
