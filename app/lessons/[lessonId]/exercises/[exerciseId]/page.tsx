"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Bookmark,
  Sun,
  Moon,
} from "lucide-react";
import PlaybackRateSelector from "../../../../../components/PlaybackRateSelector";
/* ========= Types ========= */

type Exercise = {
  id: string;
  title: string;
  audioUrl: string;
  transcript: string;
};

type Subtitle = {
  startMs: number;
  endMs: number;
  text: string;
};

export default function ExercisePage() {
  const { lessonId, exerciseId } = useParams<{
    lessonId: string;
    exerciseId: string;
  }>();

  const waveformRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [dark, setDark] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [bookmarks, setBookmarks] = useState<Subtitle[]>([]);
  const [rate, setRate] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  //   const [rateOpen, setRateOpen] = useState(false);
  /* ========= Fetch Exercise ========= */
  useEffect(() => {
    fetch(
      `http://localhost:5142/api/lessons/${lessonId}/exercises/${exerciseId}`
    )
      .then((res) => res.json())
      .then((data: Exercise) => {
        setExercise(data);
        setAudioUrl(`http://localhost:5142${data.audioUrl}`);
      })
      .catch(console.error);
  }, [lessonId, exerciseId]);

  /* ========= Mock Subtitles ========= */
  const subtitles: Subtitle[] = [
    {
      startMs: 0,
      endMs: 3000,
      text: "Customer: Hi, I'd like to order a coffee.",
    },
    {
      startMs: 3000,
      endMs: 6000,
      text: "Barista: Sure! What size would you like?",
    },
    {
      startMs: 6000,
      endMs: 10000,
      text: "Customer: Medium cappuccino, extra shot.",
    },
    { startMs: 10000, endMs: 14000, text: "Barista: Hot or iced?" },
    { startMs: 14000, endMs: 18000, text: "Customer: Hot, please." },
  ];

  /* ========= Init WaveSurfer (SAFE) ========= */
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

    ws.on("timeupdate", (sec) => {
      if (!cancelled) setCurrentMs(sec * 1000);
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
    // 更新本地 UI 状态（控制按钮显示的数字）
    setRate(newRate);

    // 更新播放器实例的倍速（这步是让音频变快的关键）
    if (wsRef.current) {
      wsRef.current.setPlaybackRate(newRate);
    }
  };

  /* ========= Controls ========= */
  const togglePlay = () => {
    if (!wsRef.current) return;
    wsRef.current.playPause();
    setIsPlaying((p) => !p);
  };

  const seekTo = (ms: number) => {
    if (!wsRef.current) return;
    const duration = wsRef.current.getDuration() * 1000;
    wsRef.current.seekTo(ms / duration);
    wsRef.current.play();
    setIsPlaying(true);
  };

  const toggleBookmark = (s: Subtitle) => {
    setBookmarks((prev) =>
      prev.find((b) => b.startMs === s.startMs)
        ? prev.filter((b) => b.startMs !== s.startMs)
        : [...prev, s]
    );
  };

  const activeIndex = subtitles.findIndex(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  );

  if (!exercise) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-3xl mx-auto p-6 space-y-8 text-gray-900 dark:text-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center">
            <button className="text-sm text-gray-500">← Back</button>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full border dark:border-gray-700"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold">{exercise.title}</h1>
            <p className="text-sm text-gray-500">
              Practice listening with interactive subtitles
            </p>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player */}
              <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">
                <div ref={waveformRef} />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <SkipBack size={18} />
                    <button
                      onClick={togglePlay}
                      className="p-3 rounded-full bg-black text-white dark:bg-white dark:text-black"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <SkipForward size={18} />
                  </div>
                  <div className="relative">
                    <PlaybackRateSelector
                      playbackRate={rate}
                      setPlaybackRate={handleRateChange}
                    />
                  </div>
                </div>
              </div>

              {/* Subtitles */}
              <div className="bg-white dark:bg-gray-800 border rounded-xl p-6 space-y-3">
                <h3 className="font-medium mb-2">Subtitles</h3>
                {subtitles.map((s, i) => {
                  const active = i === activeIndex;
                  return (
                    <div
                      key={i}
                      onClick={() => seekTo(s.startMs)}
                      className={`flex justify-between p-4 rounded-lg border cursor-pointer
                        ${
                          active
                            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                    >
                      <p className="text-sm">{s.text}</p>
                      <Bookmark
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(s);
                        }}
                        className={
                          bookmarks.find((b) => b.startMs === s.startMs)
                            ? "fill-current"
                            : ""
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-white dark:bg-gray-800 border rounded-xl p-6 h-fit">
              <h3 className="font-medium mb-3">Marked Sentences</h3>
              {bookmarks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Click the bookmark icon to save important sentences
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {bookmarks.map((b, i) => (
                    <li
                      key={i}
                      onClick={() => seekTo(b.startMs)}
                      className="p-2 rounded bg-gray-100 dark:bg-gray-700 cursor-pointer"
                    >
                      {b.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
