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
  const currentMsRef = useRef(0);

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

  useEffect(() => {
    currentMsRef.current = currentMs;
  }, [currentMs]);

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

  const subtitles: Subtitle[] = useMemo(() => {
    if (!exercise) return [];

    return (exercise.subtitles || []).map((item) => ({
      startMs: Math.round(item.startSeconds * 1000),
      endMs: Math.round(item.endSeconds * 1000),
      text: item.text,
    }));
  }, [exercise]);

  const saveExerciseProgress = (ms: number) => {
    try {
      const safeMs = Math.max(0, Math.floor(ms));
      const saved = localStorage.getItem("exerciseProgress");
      const parsed: Record<string, number> = saved ? JSON.parse(saved) : {};

      parsed[String(exerciseId)] = safeMs;

      localStorage.setItem("exerciseProgress", JSON.stringify(parsed));
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
        const savedProgress = localStorage.getItem("exerciseProgress");
        const parsed: Record<string, number> = savedProgress
          ? JSON.parse(savedProgress)
          : {};

        const savedMs = parsed[String(exerciseId)] ?? 0;

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
      }
    });

    ws.on("finish", () => {
      if (cancelled) return;

      setIsPlaying(false);

      try {
        const savedCompleted = localStorage.getItem("completedExercises");
        const completedList: string[] = savedCompleted
          ? JSON.parse(savedCompleted)
          : [];

        if (!completedList.includes(String(exerciseId))) {
          localStorage.setItem(
            "completedExercises",
            JSON.stringify([...completedList, String(exerciseId)]),
          );
        }

        const savedProgress = localStorage.getItem("exerciseProgress");
        const progressMap: Record<string, number> = savedProgress
          ? JSON.parse(savedProgress)
          : {};

        delete progressMap[String(exerciseId)];
        localStorage.setItem("exerciseProgress", JSON.stringify(progressMap));
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
  }, [audioUrl, exerciseId]);

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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <div className="in-w-0 space-y-6">
              <div className="rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                <div className="overflow-hidden rounded-[24px] bg-slate-50 p-4 shadow-inner">
                  <div
                    ref={waveformRef}
                    className="h-20 w-full rounded-[20px] bg-slate-100"
                  />
                </div>

                <div className="mt-5 overflow-visible rounded-[24px] bg-slate-50/80 p-4 shadow-sm">
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
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#ff909e] to-[#fad0c4] text-white shadow-lg transition duration-200 hover:scale-[1.04] hover:shadow-xl"
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
