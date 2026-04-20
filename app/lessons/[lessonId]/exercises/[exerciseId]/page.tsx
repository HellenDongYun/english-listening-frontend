"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import PlaybackRateSelector from "../../../../../components/PlaybackRateSelector";
import SubtitlesPanel from "../../../../../components/SubtitlesPanel";
import MarkedSentencesPanel from "@/components/MarkedSentencesPanel";
import type { ExerciseDetailDto } from "@/types/exercise";
import type { Subtitle } from "@/types/subtitle";
import type { BookmarkItem } from "@/types/BookMarkItem";
export default function ExercisePage() {
  const router = useRouter();
  const { lessonId, exerciseId } = useParams<{
    lessonId: string;
    exerciseId: string;
  }>();

  const waveformRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const currentMsRef = useRef(0);

  const [exercise, setExercise] = useState<ExerciseDetailDto | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const [playOnceSegment, setPlayOnceSegment] = useState<{
    startMs: number;
    endMs: number;
  } | null>(null);

  // ===== bookmarks store =====
  const [bookmarkStore, setBookmarkStore] = useState<
    Record<string, BookmarkItem[]>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("bookmarkStore");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0.75);
  const [volumeOpen, setVolumeOpen] = useState(false);

  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const [volumePosition, setVolumePosition] = useState({ top: 0, left: 0 });

  // ===== 统一唯一 key =====
  const storeKey = useMemo(() => {
    if (!lessonId || !exerciseId) return "";
    return `${lessonId}_${exerciseId}`;
  }, [lessonId, exerciseId]);

  const bookmarkKey = useMemo(() => {
    if (!storeKey) return "";
    return `bookmarks_${storeKey}`;
  }, [storeKey]);

  const progressKey = useMemo(() => {
    if (!storeKey) return "";
    return `progress_${storeKey}`;
  }, [storeKey]);

  const completedKey = useMemo(() => {
    if (!storeKey) return "";
    return `completed_${storeKey}`;
  }, [storeKey]);

  // ===== 当前 exercise 的 bookmarks =====
  //bookmarks 现在自动是 BookmarkItem[]
  const bookmarks = useMemo(() => {
    if (!bookmarkKey) return [];
    return bookmarkStore[bookmarkKey] ?? [];
  }, [bookmarkStore, bookmarkKey]);

  const openVolumeMenu = () => {
    if (!volumeButtonRef.current) return;

    const rect = volumeButtonRef.current.getBoundingClientRect();
    const panelWidth = 96;

    setVolumePosition({
      left: rect.left + rect.width / 2 - panelWidth / 2,
      top: rect.top - 8,
    });

    setVolumeOpen(true);
  };

  // ===== 只同步 bookmarkStore 到 localStorage =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("bookmarkStore", JSON.stringify(bookmarkStore));
    } catch (error) {
      console.error("Failed to save bookmark store", error);
    }
  }, [bookmarkStore]);

  useEffect(() => {
    currentMsRef.current = currentMs;
  }, [currentMs]);

  const clearBookmarks = () => {
    if (!bookmarkKey) return;

    setBookmarkStore((prev) => ({
      ...prev,
      [bookmarkKey]: [],
    }));
  };

  const removeBookmark = (startMs: number) => {
    if (!bookmarkKey) return;

    setBookmarkStore((prev) => ({
      ...prev,
      [bookmarkKey]: (prev[bookmarkKey] ?? []).filter(
        (b) => b.startMs !== startMs,
      ),
    }));
  };

  useEffect(() => {
    fetch(
      `http://localhost:5142/api/lessons/${lessonId}/exercises/${exerciseId}`,
    )
      .then((res) => res.json())
      .then((data: ExerciseDetailDto) => {
        setExercise(data);
        setAudioUrl(`http://localhost:5142${data.audioUrl}`);
      })
      .catch(console.error);
  }, [lessonId, exerciseId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedButton =
        volumeButtonRef.current && volumeButtonRef.current.contains(target);

      const clickedMenu =
        volumeMenuRef.current && volumeMenuRef.current.contains(target);

      if (!clickedButton && !clickedMenu) {
        setVolumeOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const subtitles: Subtitle[] = useMemo(() => {
    if (!exercise) return [];

    return (exercise.subtitles || []).map((item) => ({
      startMs: Math.round(item.startSeconds * 1000),
      endMs: Math.round(item.endSeconds * 1000),
      text: item.text,
    }));
  }, [exercise]);

  // ===== 保存进度写入 progressStore =====
  const saveExerciseProgress = (ms: number) => {
    if (!progressKey) return;

    try {
      const safeMs = Math.max(0, Math.floor(ms));
      const saved = localStorage.getItem("progressStore");
      const parsed: Record<string, number> = saved ? JSON.parse(saved) : {};

      parsed[progressKey] = safeMs;

      localStorage.setItem("progressStore", JSON.stringify(parsed));
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    let cancelled = false;

    if (wsRef.current) {
      wsRef.current.destroy();
      wsRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      height: 80,
      waveColor: "#d1d5db",
      progressColor: "#111827",
      cursorColor: "#ef4444",
      barWidth: 2,
      barGap: 2,
      normalize: true,
    });

    wsRef.current = ws;
    ws.load(audioUrl);

    ws.on("ready", () => {
      if (cancelled) return;

      const totalDurationMs = ws.getDuration() * 1000;
      setDurationMs(totalDurationMs);

      try {
        // ===== 恢复进度从 progressStore 读 =====
        const savedProgress = localStorage.getItem("progressStore");
        const parsed: Record<string, number> = savedProgress
          ? JSON.parse(savedProgress)
          : {};

        const savedMs = progressKey ? (parsed[progressKey] ?? 0) : 0;

        if (savedMs > 0 && totalDurationMs > 0) {
          const safeMs = Math.min(savedMs, Math.max(totalDurationMs - 300, 0));

          requestAnimationFrame(() => {
            if (!cancelled && wsRef.current) {
              ws.seekTo(safeMs / totalDurationMs);
              setCurrentMs(safeMs);
              currentMsRef.current = safeMs;
            }
          });
        }
      } catch (error) {
        console.error("Failed to restore progress", error);
      }
    });

    ws.on("timeupdate", (sec) => {
      if (!cancelled) {
        const ms = sec * 1000;
        setCurrentMs(ms);
        currentMsRef.current = ms;
        // 如果是 Marked Sentence 单句播放，到 endMs 自动暂停 =====
        if (playOnceSegment && ms >= playOnceSegment.endMs) {
          ws.pause();
          setIsPlaying(false);
          setPlayOnceSegment(null);
        }
      }
    });

    ws.on("finish", () => {
      if (cancelled) return;

      setIsPlaying(false);

      try {
        // ===== 完成状态写入 completedStore =====
        const savedCompleted = localStorage.getItem("completedStore");
        const completedMap: Record<string, boolean> = savedCompleted
          ? JSON.parse(savedCompleted)
          : {};

        if (completedKey) {
          completedMap[completedKey] = true;
        }

        localStorage.setItem("completedStore", JSON.stringify(completedMap));

        // ===== 完成后删除 progressStore 当前项 =====
        const savedProgress = localStorage.getItem("progressStore");
        const progressMap: Record<string, number> = savedProgress
          ? JSON.parse(savedProgress)
          : {};

        if (progressKey) {
          delete progressMap[progressKey];
        }

        localStorage.setItem("progressStore", JSON.stringify(progressMap));
      } catch (error) {
        console.error("Failed to mark exercise complete", error);
      }
    });

    ws.on("error", (e) => {
      console.error("WaveSurfer error:", e);
    });

    return () => {
      cancelled = true;

      if (wsRef.current) {
        const latestMs = wsRef.current.getCurrentTime() * 1000;
        saveExerciseProgress(latestMs);

        wsRef.current.stop();
        wsRef.current.destroy();
        wsRef.current = null;
      }
    };
  }, [audioUrl, progressKey, completedKey]);

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (wsRef.current) {
      wsRef.current.setPlaybackRate(newRate);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (wsRef.current) {
      wsRef.current.setVolume(value);
    }
  };

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.setVolume(volume);
    }
  }, [volume]);

  const handleSeek = (value: number) => {
    if (!wsRef.current || durationMs === 0) return;

    const clamped = Math.max(0, Math.min(value, durationMs));
    wsRef.current.seekTo(clamped / durationMs);
    setCurrentMs(clamped);
    currentMsRef.current = clamped;
    saveExerciseProgress(clamped);
  };

  const togglePlay = () => {
    if (!wsRef.current) return;

    const wasPlaying = isPlaying;
    wsRef.current.playPause();
    setIsPlaying((p) => !p);

    if (wasPlaying) {
      const latestMs = wsRef.current.getCurrentTime() * 1000;
      saveExerciseProgress(latestMs);
      setCurrentMs(latestMs);
      currentMsRef.current = latestMs;
    }
  };

  const seekTo = (ms: number) => {
    if (!wsRef.current) return;

    const duration = wsRef.current.getDuration() * 1000;
    if (duration <= 0) return;

    const clamped = Math.max(0, Math.min(ms, duration));

    wsRef.current.seekTo(clamped / duration);
    setCurrentMs(clamped);
    currentMsRef.current = clamped;
    saveExerciseProgress(clamped);
    wsRef.current.play();
    setIsPlaying(true);
  };

  // ===== 右侧 Marked Sentence 专用，只播放当前句 =====
  const playMarkedSentence = (startMs: number, endMs: number) => {
    if (!wsRef.current) return;

    const duration = wsRef.current.getDuration() * 1000;
    if (duration <= 0) return;

    const safeStart = Math.max(0, Math.min(startMs, duration));
    const safeEnd = Math.max(safeStart, Math.min(endMs, duration));

    setPlayOnceSegment({
      startMs: safeStart,
      endMs: safeEnd,
    });

    wsRef.current.seekTo(safeStart / duration);
    setCurrentMs(safeStart);
    currentMsRef.current = safeStart;
    saveExerciseProgress(safeStart);

    wsRef.current.play();
    setIsPlaying(true);
  };

  const stepBack = () => {
    seekTo(Math.max(0, currentMs - 5000));
  };

  const stepForward = () => {
    seekTo(Math.min(durationMs || 0, currentMs + 5000));
  };

  // 新增 bookmark 时补上 note / starred / category
  const toggleBookmark = (s: Subtitle) => {
    if (!bookmarkKey) return;

    setBookmarkStore((prev) => {
      const currentBookmarks = prev[bookmarkKey] ?? [];
      const exists = currentBookmarks.find((b) => b.startMs === s.startMs);

      return {
        ...prev,
        [bookmarkKey]: exists
          ? currentBookmarks.filter((b) => b.startMs !== s.startMs)
          : [
              ...currentBookmarks,
              {
                ...s,
                note: "",
                starred: false,
                category: "default",
              },
            ],
      };
    });
  };
  // 新增 updateBookmark，不改你现有命名体系
  const updateBookmark = (startMs: number, updates: Partial<BookmarkItem>) => {
    if (!bookmarkKey) return;

    setBookmarkStore((prev) => {
      const currentBookmarks = prev[bookmarkKey] ?? [];

      return {
        ...prev,
        [bookmarkKey]: currentBookmarks.map((item) =>
          item.startMs === startMs ? { ...item, ...updates } : item,
        ),
      };
    });
  };

  const activeIndex = subtitles.findIndex(
    (s) => currentMs >= s.startMs && currentMs < s.endMs,
  );

  if (!exercise) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 transition-colors">
        <div className="mx-auto max-w-6xl space-y-8 p-6 text-gray-900">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              <ArrowLeft size={16} className="shrink-0" />
              <span>Back</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-black">
              {exercise.title}
            </h1>
            <p className="text-sm text-gray-500">
              Practice listening with interactive subtitles
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <div className="in-w-0 space-y-6">
              <div className="rounded-4xl bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <div className="overflow-hidden rounded-3xl bg-slate-50 p-4 shadow-inner">
                  <div
                    ref={waveformRef}
                    className="h-20 w-full rounded-[20px] bg-slate-100"
                  />
                </div>

                <div className="mt-5 overflow-visible rounded-3xl bg-slate-50/80 p-4 shadow-sm">
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>{formatTime(currentMs)}</span>
                      <span>{formatTime(durationMs)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={durationMs}
                      value={Math.min(currentMs, durationMs)}
                      onInput={(e) =>
                        handleSeek(Number((e.target as HTMLInputElement).value))
                      }
                      className="mt-2 w-full accent-[#ff909e]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex items-center gap-3 overflow-visible">
                      <button
                        onClick={stepBack}
                        type="button"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                        aria-label="Rewind 5 seconds"
                      >
                        <SkipBack size={22} />
                      </button>

                      <button
                        onClick={togglePlay}
                        type="button"
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-[#ff909e] to-[#fad0c4] text-white shadow-lg transition duration-200 hover:scale-[1.04] hover:shadow-xl"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                      </button>

                      <button
                        onClick={stepForward}
                        type="button"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                        aria-label="Forward 5 seconds"
                      >
                        <SkipForward size={22} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          ref={volumeButtonRef}
                          onClick={() =>
                            volumeOpen ? setVolumeOpen(false) : openVolumeMenu()
                          }
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                          aria-label="Volume"
                        >
                          <Volume2 size={18} />
                        </button>

                        {volumeOpen && (
                          <div
                            ref={volumeMenuRef}
                            style={{
                              position: "fixed",
                              left: volumePosition.left,
                              top: volumePosition.top,
                              transform: "translateY(-100%)",
                              zIndex: 9999,
                              width: "104px",
                            }}
                            className="rounded-2xl bg-white px-3 py-3 shadow-xl ring-1 ring-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative w-full">
                              <div
                                className="pointer-events-none absolute -top-5 text-xs font-medium text-slate-600"
                                style={{
                                  left: `${volume * 100}%`,
                                  transform: "translateX(-50%)",
                                }}
                              >
                                {Math.round(volume * 100)}%
                              </div>

                              <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e) =>
                                  handleVolumeChange(Number(e.target.value))
                                }
                                className="volume-slider block w-full"
                                style={
                                  {
                                    "--progress": `${volume * 100}%`,
                                  } as React.CSSProperties
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <PlaybackRateSelector
                        playbackRate={rate}
                        setPlaybackRate={handleRateChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <SubtitlesPanel
                subtitles={subtitles}
                activeIndex={activeIndex}
                seekTo={seekTo}
                bookmarks={bookmarks}
                toggleBookmark={toggleBookmark}
              />
            </div>

            <div className="self-start">
              <MarkedSentencesPanel
                bookmarks={bookmarks}
                seekTo={(startMs, endMs) => playMarkedSentence(startMs, endMs)}
                onClear={clearBookmarks}
                onRemove={removeBookmark}
                onUpdate={updateBookmark}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
