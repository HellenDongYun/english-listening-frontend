import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";

interface PlaybackRateSelectorProps {
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  rates?: number[];
}

const PlaybackRateSelector: React.FC<PlaybackRateSelectorProps> = ({
  playbackRate = 1,
  setPlaybackRate,
  rates = [0.5, 0.75, 1, 1.25, 1.5, 2],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPosition({
      left: rect.right - 72,
      top: rect.top - 8,
    });

    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedButton =
        buttonRef.current && buttonRef.current.contains(target);

      const clickedMenu = menuRef.current && menuRef.current.contains(target);

      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* 按钮 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className="flex h-10 min-w-18 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      >
        <SlidersHorizontal size={15} />
        <span>{playbackRate}x</span>
      </button>

      {/* 菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            transform: "translateY(-100%)",
            zIndex: 9999,
            width: "84px",
          }}
          className="overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-slate-100"
        >
          {rates.map((rateOption) => (
            <button
              key={rateOption}
              type="button"
              onClick={() => {
                setPlaybackRate(rateOption);
                setIsOpen(false);
              }}
              className={`block w-full px-3 py-2 text-center text-sm transition ${
                playbackRate === rateOption
                  ? "bg-slate-100 font-semibold text-slate-900"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {rateOption}x
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default PlaybackRateSelector;
