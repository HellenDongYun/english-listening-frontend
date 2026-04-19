"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Subtitle } from "@/types/subtitle";
import HighlightText from "@/components/HighlightText"; // ✅ 新增

type Props = {
  bookmarks: Subtitle[];
  seekTo: (startMs: number) => void;
  onClear: () => void;
  onRemove: (startMs: number) => void;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function MarkedSentencesPanel({
  bookmarks,
  seekTo,
  onClear,
  onRemove,
}: Props) {
  const [search, setSearch] = useState("");

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const filteredBookmarks = useMemo(() => {
    if (!search.trim()) return bookmarks;

    const keyword = search.toLowerCase();

    return bookmarks.filter((b) => b.text.toLowerCase().includes(keyword));
  }, [bookmarks, search]);

  return (
    <div className="sticky top-6 w-full max-h-[80vh] flex flex-col rounded-2xl bg-white p-5 shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between shrink-0">
        <h3 className="text-lg font-semibold text-slate-900">
          Marked Sentences ({bookmarks.length})
        </h3>

        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* 搜索框 */}
      {bookmarks.length > 0 && (
        <input
          type="text"
          placeholder="Search marked sentences..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40"
        />
      )}

      {/* 内容 */}
      {filteredBookmarks.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 shadow-sm">
          {search ? "No matching sentences 😢" : "No bookmarks yet"}
        </div>
      ) : (
        <div className="overflow-y-auto pr-1 space-y-3 text-sm">
          {filteredBookmarks.map((b, i) => {
            const isExpanded = expanded[i];
            const shouldTruncate = b.text.length > 80;

            const displayText =
              shouldTruncate && !isExpanded
                ? b.text.slice(0, 80) + "..."
                : b.text;

            return (
              <div
                key={`${b.startMs}-${i}`}
                className="group rounded-xl bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex min-w-0 gap-3 cursor-pointer"
                    onClick={() => seekTo(b.startMs)}
                  >
                    <span className="mt-0.5 w-12 shrink-0 text-xs font-semibold text-slate-500">
                      {formatTime(b.startMs)}
                    </span>

                    {/* ✅ 核心修改：使用 HighlightText */}
                    <div className="text-slate-700 leading-6">
                      <HighlightText text={displayText} keyword={search} />

                      {shouldTruncate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) => ({
                              ...prev,
                              [i]: !prev[i],
                            }));
                          }}
                          className="ml-2 text-xs text-blue-500 hover:underline"
                        >
                          {isExpanded ? "Less" : "More"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(b.startMs);
                    }}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
