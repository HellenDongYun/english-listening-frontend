"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import type { Subtitle } from "@/types/subtitle";

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
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Subtitles</h3>
        <span className="text-xs text-slate-500">
          {filteredSubtitles.length} / {subtitles.length}
        </span>
      </div>

      {/* search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subtitles..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"
        />
      </div>

      {/* list */}
      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-2">
        {filteredSubtitles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
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
                className={`cursor-pointer rounded-lg border p-3 transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {/* time */}
                    <span
                      className={`w-12 shrink-0 text-xs font-medium ${
                        active ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {formatTime(s.startMs)}
                    </span>

                    {/* text */}
                    <p className="min-w-0 text-sm leading-6 break-words">
                      {s.text}
                    </p>
                  </div>

                  {/* bookmark */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(s);
                    }}
                    className={`shrink-0 rounded-md p-1 transition ${
                      active ? "hover:bg-white/10" : "hover:bg-slate-200"
                    }`}
                  >
                    <Bookmark
                      size={16}
                      className={isBookmarked ? "fill-current" : ""}
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
