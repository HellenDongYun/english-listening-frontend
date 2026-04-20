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
  Repeat,
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
  // ===== 新增 ref，给 WaveSurfer 事件读取最新状态，不触发重建 =====
  const playOnceSegmentRef = useRef<{
    startMs: number;
    endMs: number;
  } | null>(null);

  const loopSegmentRef = useRef<{
    startMs: number;
    endMs: number;
  } | null>(null);

  const [exercise, setExercise] = useState<ExerciseDetailDto | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const [playOnceSegment, setPlayOnceSegment] = useState<{
    startMs: number;
    endMs: number;
  } | null>(null);

  // ===== 修改 1：单句循环状态 =====
  const [loopSegment, setLoopSegment] = useState<{
    startMs: number;
    endMs: number;
  } | null>(null);

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

  // ===== 同步 playOnceSegment 到 ref =====
  useEffect(() => {
    playOnceSegmentRef.current = playOnceSegment;
  }, [playOnceSegment]);

  // ===== ：同步 loopSegment 到 ref =====
  useEffect(() => {
    loopSegmentRef.current = loopSegment;
  }, [loopSegment]);

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

  const currentSubtitle = useMemo(() => {
    return (
      subtitles.find((s) => currentMs >= s.startMs && currentMs < s.endMs) ??
      null
    );
  }, [subtitles, currentMs]);

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

    // ===== 修改 2：播放状态只交给 WaveSurfer 事件管理 =====
    ws.on("play", () => {
      if (!cancelled) {
        setIsPlaying(true);
      }
    });

    ws.on("pause", () => {
      if (!cancelled) {
        setIsPlaying(false);
      }
    });

    ws.on("timeupdate", (sec) => {
      if (!cancelled) {
        const ms = sec * 1000;
        setCurrentMs(ms);
        currentMsRef.current = ms;

        const currentPlayOnceSegment = playOnceSegmentRef.current;
        if (currentPlayOnceSegment && ms >= currentPlayOnceSegment.endMs) {
          ws.pause();
          setPlayOnceSegment(null);
          return;
        }

        const currentLoopSegment = loopSegmentRef.current;
        if (currentLoopSegment && ms >= currentLoopSegment.endMs) {
          const totalDuration = ws.getDuration() * 1000;
          if (totalDuration > 0) {
            ws.seekTo(currentLoopSegment.startMs / totalDuration);
            setCurrentMs(currentLoopSegment.startMs);
            currentMsRef.current = currentLoopSegment.startMs;
          }
        }
      }
    });

    ws.on("finish", () => {
      if (cancelled) return;

      // ===== 修改 5：完整播完时清理模式，但不手动 setIsPlaying =====
      setPlayOnceSegment(null);
      setLoopSegment(null);

      try {
        const savedCompleted = localStorage.getItem("completedStore");
        const completedMap: Record<string, boolean> = savedCompleted
          ? JSON.parse(savedCompleted)
          : {};

        if (completedKey) {
          completedMap[completedKey] = true;
        }

        localStorage.setItem("completedStore", JSON.stringify(completedMap));

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

    // ===== 修改 6：手动拖动时，退出单句播放和单句循环 =====
    setPlayOnceSegment(null);
    setLoopSegment(null);

    wsRef.current.seekTo(clamped / durationMs);
    setCurrentMs(clamped);
    currentMsRef.current = clamped;
    saveExerciseProgress(clamped);
  };

  const togglePlay = () => {
    if (!wsRef.current) return;

    // ===== 修改 7：主播放按钮只退出单句播放，不手动 setIsPlaying =====
    setPlayOnceSegment(null);

    const wasPlaying = wsRef.current.isPlaying();

    wsRef.current.playPause();

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

    // ===== 修改 8：普通字幕点击时，退出单句播放和单句循环 =====
    setPlayOnceSegment(null);
    setLoopSegment(null);

    wsRef.current.seekTo(clamped / duration);
    setCurrentMs(clamped);
    currentMsRef.current = clamped;
    saveExerciseProgress(clamped);
    wsRef.current.play();
  };

  const playMarkedSentence = (startMs: number, endMs: number) => {
    if (!wsRef.current) return;

    const duration = wsRef.current.getDuration() * 1000;
    if (duration <= 0) return;

    const safeStart = Math.max(0, Math.min(startMs, duration));
    const safeEnd = Math.max(safeStart, Math.min(endMs, duration));

    // ===== 修改 9：右侧单句播放时，退出单句循环，不手动 setIsPlaying =====
    setLoopSegment(null);

    setPlayOnceSegment({
      startMs: safeStart,
      endMs: safeEnd,
    });

    wsRef.current.seekTo(safeStart / duration);
    setCurrentMs(safeStart);
    currentMsRef.current = safeStart;
    saveExerciseProgress(safeStart);

    wsRef.current.play();
  };

  const toggleCurrentSentenceLoop = () => {
    if (!wsRef.current || !currentSubtitle || durationMs === 0) return;

    const sameLoop =
      loopSegment &&
      loopSegment.startMs === currentSubtitle.startMs &&
      loopSegment.endMs === currentSubtitle.endMs;

    // ===== 修改 10：如果当前已经在循环这一句，就关闭循环 =====
    if (sameLoop) {
      setLoopSegment(null);
      return;
    }

    // 开启循环时，关闭单句播放模式
    setPlayOnceSegment(null);

    const nextLoop = {
      startMs: currentSubtitle.startMs,
      endMs: currentSubtitle.endMs,
    };

    setLoopSegment(nextLoop);

    wsRef.current.seekTo(currentSubtitle.startMs / durationMs);
    setCurrentMs(currentSubtitle.startMs);
    currentMsRef.current = currentSubtitle.startMs;
    saveExerciseProgress(currentSubtitle.startMs);

    // ===== 修改 11：只有当前没在播放时才 play，不手动 setIsPlaying =====
    if (!wsRef.current.isPlaying()) {
      wsRef.current.play();
    }
  };

  const stepBack = () => {
    // ===== 修改 12：前进后退时退出单句播放和单句循环 =====
    setPlayOnceSegment(null);
    setLoopSegment(null);
    seekTo(Math.max(0, currentMs - 5000));
  };

  const stepForward = () => {
    // ===== 修改 13：前进后退时退出单句播放和单句循环 =====
    setPlayOnceSegment(null);
    setLoopSegment(null);
    seekTo(Math.min(durationMs || 0, currentMs + 5000));
  };

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

  const isLoopingCurrentSentence =
    !!currentSubtitle &&
    !!loopSegment &&
    loopSegment.startMs === currentSubtitle.startMs &&
    loopSegment.endMs === currentSubtitle.endMs;

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

                      <button
                        type="button"
                        onClick={toggleCurrentSentenceLoop}
                        disabled={!currentSubtitle}
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-md transition duration-200 ${
                          isLoopingCurrentSentence
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            : "bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        aria-label="Loop current sentence"
                        title={
                          currentSubtitle
                            ? isLoopingCurrentSentence
                              ? "Stop sentence loop"
                              : "Loop current sentence"
                            : "No active sentence"
                        }
                      >
                        <Repeat size={22} />
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

                  {isLoopingCurrentSentence && currentSubtitle && (
                    <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Sentence loop is on: {formatTime(currentSubtitle.startMs)}{" "}
                      - {formatTime(currentSubtitle.endMs)}
                    </div>
                  )}
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
