"use client";

import type { Subtitle } from "@/types/subtitle";

type Props = {
  bookmarks: Subtitle[];
  seekTo: (startMs: number) => void;
  onClear: () => void;
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
}: Props) {
  return (
    <div className="sticky top-6 h-fit w-full rounded-xl border  border-slate-200 bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-slate-800">Marked Sentences</h3>

        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <p className="text-sm text-slate-500">
          Click the bookmark icon to save important sentences
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {bookmarks.map((b, i) => (
            <li
              key={`${b.startMs}-${i}`}
              onClick={() => seekTo(b.startMs)}
              className="cursor-pointer rounded-lg bg-slate-100 p-3 transition hover:bg-slate-200"
            >
              <div className="flex gap-3">
                <span className="w-12 shrink-0 text-xs text-slate-500">
                  {formatTime(b.startMs)}
                </span>

                <span className="break-words text-slate-700">{b.text}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
