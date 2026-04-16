"use client";

import { X } from "lucide-react";
import type { Subtitle } from "@/types/subtitle";

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
  return (
    <div className="sticky top-6 h-fit w-full rounded-2xl bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Marked Sentences
        </h3>

        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
          >
            Clear all
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 shadow-sm">
          Click the bookmark icon to save important sentences
        </div>
      ) : (
        <ul className="space-y-3 text-sm">
          {bookmarks.map((b, i) => (
            <li
              key={`${b.startMs}-${i}`}
              onClick={() => seekTo(b.startMs)}
              className="cursor-pointer rounded-xl bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 w-12 shrink-0 text-xs font-semibold text-slate-500">
                    {formatTime(b.startMs)}
                  </span>

                  <span className="break-words leading-6 text-slate-700">
                    {b.text}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(b.startMs);
                  }}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove bookmarked sentence"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
