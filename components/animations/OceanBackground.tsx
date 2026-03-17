"use client";

import { useEffect, useRef } from "react";

export default function OceanBackground() {
  const howlerRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let howl: { stop: () => void } | null = null;

    import("howler").then(({ Howl }) => {
      howl = new Howl({
        src: ["/sounds/ocean-waves.mp3"],
        loop: true,
        volume: 0.3,
        autoplay: false,
      });
      howlerRef.current = howl;
    });

    return () => {
      howl?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky-900 via-blue-900 to-blue-950">
      {/* 별/빛 효과 */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 60 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* 달 */}
      <div className="absolute top-12 right-16 w-16 h-16 rounded-full bg-yellow-50 opacity-80 shadow-[0_0_40px_10px_rgba(255,255,200,0.3)]" />

      {/* 파도 레이어 3겹 */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "220px" }}
      >
        {/* 뒤쪽 파도 */}
        <path
          className="animate-wave-slow"
          fill="rgba(30, 58, 138, 0.5)"
          d="M0,160 C360,220 720,100 1080,160 C1260,190 1380,140 1440,160 L1440,320 L0,320 Z"
        />
        {/* 중간 파도 */}
        <path
          className="animate-wave-medium"
          fill="rgba(29, 78, 216, 0.6)"
          d="M0,200 C240,160 480,240 720,200 C960,160 1200,240 1440,200 L1440,320 L0,320 Z"
        />
        {/* 앞쪽 파도 */}
        <path
          className="animate-wave-fast"
          fill="rgba(37, 99, 235, 0.8)"
          d="M0,240 C180,200 360,270 540,240 C720,210 900,270 1080,240 C1260,210 1380,260 1440,240 L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}
