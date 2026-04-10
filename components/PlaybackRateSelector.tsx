import React, { useState, useRef, useEffect } from "react";
import { Gauge, ChevronRight } from "lucide-react";

interface PlaybackRateSelectorProps {
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  rates?: number[];
}

/**
 * PlaybackRateSelector Component
 * A sleek, capsule-style UI for selecting video playback speeds.
 */
const PlaybackRateSelector: React.FC<PlaybackRateSelectorProps> = ({
  playbackRate = 1,
  setPlaybackRate,
  rates = [0.5, 0.75, 1, 1.25, 1.5, 2],
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Specifically typed as HTMLDivElement to fix 'contains' property error
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Explicitly typing the native MouseEvent
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center font-sans" ref={containerRef}>
      <div
        className={`
          relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg
          rounded-full p-1 overflow-hidden
          ${isOpen ? "max-w-[600px] ring-2 ring-blue-500/10" : "max-w-[100px]"}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 flex-shrink-0
            ${
              isOpen
                ? "bg-blue-50 text-blue-600 font-bold"
                : "hover:bg-slate-50 text-slate-700"
            }
          `}
        >
          <div className="relative">
            <Gauge size={16} className={isOpen ? "animate-pulse" : ""} />
            {playbackRate !== 1 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <span className="text-sm tracking-tight">{playbackRate}x</span>
          {isOpen && (
            <ChevronRight size={14} className="rotate-180 opacity-40 ml-1" />
          )}
        </button>

        {/* Divider */}
        <div
          className={`w-[1px] h-4 bg-slate-200 mx-1 transition-opacity duration-300 flex-shrink-0 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Expanded Rate Options */}
        <div
          className={`flex items-center gap-1.5 px-2 transition-all duration-300 whitespace-nowrap ${
            isOpen
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-4 pointer-events-none"
          }`}
        >
          {rates.map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setPlaybackRate(rate);
                setIsOpen(false);
              }}
              className={`
                px-2.5 py-1 text-xs font-bold rounded-full transition-all active:scale-90
                ${
                  playbackRate === rate
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }
              `}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaybackRateSelector;
