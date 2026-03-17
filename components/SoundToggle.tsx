"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface HowlLike {
  play: () => void;
  stop: () => void;
  volume: (v?: number) => number;
  playing: () => boolean;
}

export default function SoundToggle({ isDaytime = false }: { isDaytime?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showSlider, setShowSlider] = useState(false);
  const howlRef = useRef<HowlLike | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("howler").then(({ Howl }) => {
      howlRef.current = new Howl({
        src: ["/sounds/ocean-waves.mp3"],
        loop: true,
        volume: 0.3,
      }) as unknown as HowlLike;
    });

    return () => {
      howlRef.current?.stop();
    };
  }, []);

  const toggle = () => {
    if (!howlRef.current) return;
    if (playing) {
      howlRef.current.stop();
    } else {
      howlRef.current.volume(volume);
      howlRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = useCallback(
    (v: number) => {
      setVolume(v);
      if (howlRef.current) {
        howlRef.current.volume(v);
      }
      if (v === 0 && playing) {
        howlRef.current?.stop();
        setPlaying(false);
      } else if (v > 0 && !playing && howlRef.current) {
        howlRef.current.volume(v);
        howlRef.current.play();
        setPlaying(true);
      }
    },
    [playing]
  );

  const startHideTimer = () => {
    hideTimer.current = setTimeout(() => setShowSlider(false), 1800);
  };

  const clearHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handleEnter = () => {
    clearHideTimer();
    setShowSlider(true);
  };

  const handleLeave = () => {
    startHideTimer();
  };

  // 슬라이더 외부 클릭 시 닫기 (모바일)
  useEffect(() => {
    if (!showSlider) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showSlider]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {/* 토글 버튼 */}
      <button
        onClick={toggle}
        className={`p-1.5 rounded-lg backdrop-blur-sm transition-all ${isDaytime ? "text-white/70 hover:text-white hover:bg-black/15" : "text-white/30 hover:text-white/60 hover:bg-white/8"}`}
        aria-label={playing ? "소리 끄기" : "파도 소리 켜기"}
        title={playing ? "소리 끄기" : "파도 소리 켜기"}
      >
        {playing ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        )}
      </button>

      {/* 볼륨 슬라이더 */}
      <div
        className={`absolute top-full mt-2 flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 ${
          showSlider
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* 세로 슬라이더 */}
        <div className="relative h-20 w-5 flex items-center justify-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            aria-label="볼륨 조절"
          />
        </div>
        <span className="text-white/40" style={{ fontSize: "0.5rem" }}>
          {Math.round(volume * 100)}
        </span>
      </div>
    </div>
  );
}
