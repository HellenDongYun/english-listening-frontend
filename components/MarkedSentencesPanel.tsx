"use client";

import { useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import type { BookmarkItem } from "@/types/BookMarkItem";
import HighlightText from "@/components/HighlightText";

type Props = {
  bookmarks: BookmarkItem[];

  // ===== seekTo 现在同时接收 startMs 和 endMs =====
  seekTo: (startMs: number, endMs: number) => void;

  onClear: () => void;
  onRemove: (startMs: number) => void;
  onUpdate: (startMs: number, updates: Partial<BookmarkItem>) => void;
};

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ===== 根据分类给颜色 =====
function getCategoryClass(category?: string) {
  switch (category) {
    case "important":
      return "bg-red-50 border-red-200 text-red-600";
    case "grammar":
      return "bg-blue-50 border-blue-200 text-blue-600";
    case "vocab":
      return "bg-emerald-50 border-emerald-200 text-emerald-600";
    default:
      return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

export default function MarkedSentencesPanel({
  bookmarks,
  seekTo,
  onClear,
  onRemove,
  onUpdate,
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

      {bookmarks.length > 0 && (
        <input
          type="text"
          placeholder="Search marked sentences..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff909e]/40"
        />
      )}

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

            const categoryClass = getCategoryClass(b.category);

            return (
              <div
                key={`${b.startMs}-${i}`}
                className={`group rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md ${categoryClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* ===== 只有这一块点击才播放 ===== */}
                  <div
                    className="flex min-w-0 flex-1 gap-3 cursor-pointer"
                    onClick={() => seekTo(b.startMs, b.endMs)}
                  >
                    <span className="mt-0.5 w-12 shrink-0 text-xs font-semibold">
                      {formatTime(b.startMs)}
                    </span>

                    <div className="min-w-0 flex-1 leading-6">
                      <HighlightText text={displayText} keyword={search} />

                      {shouldTruncate && (
                        <button
                          onClick={(e) => {
                            // ===== 阻止播放 =====
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

                      {/* 分类 */}
                      <div
                        className="mt-3"
                        onClick={(e) => e.stopPropagation()} // ===== 阻止点击分类时播放 =====
                      >
                        <select
                          value={b.category ?? "default"}
                          onChange={(e) =>
                            onUpdate(b.startMs, {
                              category: e.target.value,
                            })
                          }
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#ff909e]/30"
                        >
                          <option value="default">Default</option>
                          <option value="important">Important</option>
                          <option value="grammar">Grammar</option>
                          <option value="vocab">Vocabulary</option>
                        </select>
                      </div>

                      {/* note */}
                      <div
                        className="mt-2"
                        onClick={(e) => e.stopPropagation()} // ===== 阻止点击 note 时播放 =====
                      >
                        <textarea
                          value={b.note ?? ""}
                          onChange={(e) =>
                            onUpdate(b.startMs, {
                              note: e.target.value,
                            })
                          }
                          placeholder="Add note..."
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff909e]/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start gap-1">
                    {/* 星标 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        // =====：阻止点击星标时播放 =====
                        e.stopPropagation();
                        onUpdate(b.startMs, {
                          starred: !b.starred,
                        });
                      }}
                      className={`rounded-lg p-2 transition ${
                        b.starred
                          ? "bg-amber-100 text-amber-500"
                          : "text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                      }`}
                      title="Star"
                    >
                      <Star
                        size={16}
                        className={b.starred ? "fill-current" : ""}
                      />
                    </button>

                    {/* 删除 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        // ===== 阻止点击删除时播放 =====
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
