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

export default function ExercisePage() {
  const router = useRouter();
  const { lessonId, exerciseId } = useParams<{
    lessonId: string;
    exerciseId: string;
  }>();

  const waveformRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  const [exercise, setExercise] = useState<ExerciseDetailDto | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const [bookmarks, setBookmarks] = useState<Subtitle[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(0.75);
  const [volumeOpen, setVolumeOpen] = useState(false);

  const volumeMenuRef = useRef<HTMLDivElement>(null);
  const volumeButtonRef = useRef<HTMLButtonElement>(null);
  const [volumePosition, setVolumePosition] = useState({ top: 0, left: 0 });

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
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const clearBookmarks = () => {
    setBookmarks([]);
  };

  const removeBookmark = (startMs: number) => {
    setBookmarks((prev) => prev.filter((b) => b.startMs !== startMs));
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

  // 用后端返回的 subtitles 转成前端需要的 Subtitle[]
  const subtitles: Subtitle[] = useMemo(() => {
    if (!exercise) return [];

    return (exercise.subtitles || []).map((item) => ({
      startMs: Math.round(item.startSeconds * 1000),
      endMs: Math.round(item.endSeconds * 1000),
      text: item.text,
    }));
  }, [exercise]);

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
      if (!cancelled) {
        setDurationMs(ws.getDuration() * 1000);
      }
    });

    ws.on("timeupdate", (sec) => {
      if (!cancelled) {
        setCurrentMs(sec * 1000);
      }
    });

    ws.on("finish", () => {
      if (!cancelled) setIsPlaying(false);
    });

    ws.on("error", (e) => {
      console.error("WaveSurfer error:", e);
    });

    return () => {
      cancelled = true;
      if (wsRef.current) {
        wsRef.current.stop();
        wsRef.current.destroy();
        wsRef.current = null;
      }
    };
  }, [audioUrl]);

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

  const syncCurrentPosition = (ms: number) => {
    const clamped = Math.max(0, Math.min(ms, durationMs || 0));
    setCurrentMs(clamped);
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
    syncCurrentPosition(clamped);
  };

  const togglePlay = () => {
    if (!wsRef.current) return;
    wsRef.current.playPause();
    setIsPlaying((p) => !p);
  };

  const seekTo = (ms: number) => {
    if (!wsRef.current) return;

    const duration = wsRef.current.getDuration() * 1000;
    if (duration <= 0) return;

    const clamped = Math.max(0, Math.min(ms, duration));

    wsRef.current.seekTo(clamped / duration);
    syncCurrentPosition(clamped);
    wsRef.current.play();
    setIsPlaying(true);
  };

  const stepBack = () => {
    seekTo(Math.max(0, currentMs - 5000));
  };

  const stepForward = () => {
    seekTo(Math.min(durationMs || 0, currentMs + 5000));
  };

  const toggleBookmark = (s: Subtitle) => {
    setBookmarks((prev) =>
      prev.find((b) => b.startMs === s.startMs)
        ? prev.filter((b) => b.startMs !== s.startMs)
        : [...prev, s],
    );
  };

  // 当前播放到哪一句字幕
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
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95"
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <div className="in-w-0 space-y-6">
              <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-2xl shadow-slate-200/30">
                <div className="overflow-hidden rounded-[24px] bg-slate-100 p-4">
                  <div
                    ref={waveformRef}
                    className="h-20 w-full rounded-[20px] bg-slate-100 "
                  />
                </div>

                <div className="mt-5 overflow-visible rounded-[24px] bg-slate-50 p-2 shadow-sm shadow-slate-200/40 dark:shadow-none">
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
                      className="w-full mt-3 accent-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex items-center gap-3 overflow-visible">
                      <button
                        onClick={stepBack}
                        type="button"
                        className="flex h-14 w-14 items-center bg-white justify-center rounded-full shadow-sm transition-transform hover:scale-[1.03] hover:bg-slate-100 dark:text-slate-600"
                        aria-label="Rewind 5 seconds"
                      >
                        <SkipBack size={22} />
                      </button>

                      <button
                        onClick={togglePlay}
                        type="button"
                        className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-transform duration-200 hover:scale-[1.03] dark:bg-slate-100 dark:text-slate-950"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                      </button>

                      <button
                        onClick={stepForward}
                        type="button"
                        className="flex h-14 w-14 items-center bg-white justify-center rounded-full shadow-sm transition-transform hover:scale-[1.03] hover:bg-slate-100 dark:text-slate-600"
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
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
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
                              width: "96px",
                            }}
                            className="rounded-xl bg-white px-2 py-2 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative w-full">
                              <div
                                className="pointer-events-none absolute -top-5 text-xs text-slate-600"
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
                                className="volume-slider w-full block"
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

            <MarkedSentencesPanel
              bookmarks={bookmarks}
              seekTo={seekTo}
              onClear={clearBookmarks}
              onRemove={removeBookmark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
