"use client";

import type { OceanTheme } from "@/lib/oceanTheme";
import { getWashBackground, getWaveColors } from "@/lib/oceanTheme";
import { HORIZON_PCT, SHORE_PCT, BEACH_PCT } from "./constants";

interface Props {
  theme: OceanTheme;
  waveColors: ReturnType<typeof getWaveColors>;
  sunPos: { x: number; y: number } | null;
}

// xRel: 반사 기둥 중심 기준 정규화 오프셋 (-1 ~ 1)
// 실제 x = sunPos.x + xRel * (3 + y * 0.18)  → 수평선에서 수렴, 해안에서 퍼짐
// y: 바다 영역 내 수직 위치 (0~100%), w/h: px, delay/duration: s
const SUN_SPARKLES: { xRel: number; y: number; w: number; h: number; delay: number; duration: number }[] = [
  // 수평선 근처 (y 3~28)
  { xRel: -0.5, y:  4, w:  9, h: 1, delay: 0.0, duration: 2.5 },
  { xRel:  0.8, y:  7, w:  7, h: 1, delay: 1.4, duration: 3.0 },
  { xRel: -0.2, y: 11, w: 10, h: 1, delay: 2.8, duration: 2.8 },
  { xRel:  0.5, y: 15, w:  8, h: 1, delay: 0.6, duration: 2.6 },
  { xRel: -0.9, y: 18, w:  7, h: 1, delay: 3.5, duration: 2.9 },
  { xRel:  0.2, y: 22, w:  9, h: 1, delay: 1.8, duration: 2.7 },
  { xRel: -0.6, y: 26, w:  8, h: 1, delay: 2.2, duration: 3.1 },
  { xRel:  0.9, y: 10, w:  6, h: 1, delay: 0.9, duration: 2.5 },
  { xRel: -0.3, y:  5, w:  8, h: 1, delay: 4.0, duration: 3.0 },
  { xRel:  0.6, y: 20, w:  9, h: 1, delay: 3.0, duration: 2.8 },
  // 중간 (y 30~62)
  { xRel: -0.7, y: 33, w: 13, h: 1, delay: 0.4, duration: 3.2 },
  { xRel:  0.3, y: 38, w: 15, h: 1, delay: 2.6, duration: 3.5 },
  { xRel: -0.1, y: 43, w: 14, h: 1, delay: 1.2, duration: 3.3 },
  { xRel:  0.8, y: 48, w: 12, h: 1, delay: 3.8, duration: 3.0 },
  { xRel: -0.9, y: 52, w: 13, h: 1, delay: 1.0, duration: 3.4 },
  { xRel:  0.5, y: 57, w: 15, h: 1, delay: 2.4, duration: 3.2 },
  { xRel: -0.4, y: 35, w: 12, h: 1, delay: 4.2, duration: 3.1 },
  { xRel:  0.1, y: 44, w: 14, h: 1, delay: 1.7, duration: 3.5 },
  { xRel: -0.8, y: 55, w: 13, h: 1, delay: 3.2, duration: 3.3 },
  { xRel:  0.7, y: 40, w: 11, h: 1, delay: 0.7, duration: 3.0 },
  { xRel: -0.5, y: 60, w: 14, h: 1, delay: 2.0, duration: 3.4 },
  // 해안 근처 (y 65~90)
  { xRel: -0.6, y: 65, w: 20, h: 2, delay: 0.5, duration: 3.8 },
  { xRel:  0.4, y: 70, w: 22, h: 2, delay: 3.0, duration: 4.2 },
  { xRel: -0.2, y: 75, w: 24, h: 2, delay: 1.5, duration: 4.0 },
  { xRel:  0.9, y: 80, w: 21, h: 2, delay: 4.0, duration: 4.3 },
  { xRel: -0.8, y: 85, w: 23, h: 2, delay: 0.8, duration: 3.9 },
  { xRel:  0.2, y: 90, w: 26, h: 2, delay: 3.4, duration: 4.1 },
  { xRel: -0.5, y: 68, w: 20, h: 2, delay: 2.0, duration: 4.0 },
  { xRel:  0.7, y: 78, w: 22, h: 2, delay: 1.2, duration: 4.2 },
  { xRel: -0.3, y: 88, w: 24, h: 2, delay: 4.4, duration: 4.3 },
];

export default function OceanWaves({ theme, waveColors, sunPos }: Props) {
  return (
    <>
      {/* ── 바다 표면 파도결 ── */}
      <div
        className="absolute w-full pointer-events-none overflow-hidden"
        style={{
          top: `${HORIZON_PCT * 100 + 2}%`,
          height: `${(SHORE_PCT - HORIZON_PCT) * 100 - 4}%`,
          zIndex: 4,
        }}
      >
        <div
          className="ocean-ripple-layer ocean-ripple-1"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
        <div
          className="ocean-ripple-layer ocean-ripple-2"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
        <div
          className="ocean-ripple-layer ocean-ripple-3"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
      </div>

      {/* ── 바다 표면 빛 반짝임 ── */}
      <div
        className="absolute pointer-events-none ocean-shimmer"
        style={{
          top: `${HORIZON_PCT * 100 + 5}%`,
          left: "5%",
          width: "90%",
          height: `${(SHORE_PCT - HORIZON_PCT) * 100 - 8}%`,
          zIndex: 5,
        }}
      />

      {/* ── 햇빛 바다 반사 글리터 ── */}
      {theme.sunOpacity > 0.25 && sunPos && (
        <div
          className="absolute w-full pointer-events-none overflow-hidden"
          style={{
            top: `${HORIZON_PCT * 100 + 1}%`,
            height: `${(SHORE_PCT - HORIZON_PCT) * 100 - 2}%`,
            zIndex: 6,
            opacity: Math.min(theme.sunOpacity * 1.1, 1),
          }}
        >
          {SUN_SPARKLES.map((s, i) => {
            // 수평선에서 수렴(±8%), 해안에서 퍼짐(±38%)
            const bandHalf = 8 + s.y * 0.30;
            const x = Math.max(1, Math.min(99, sunPos.x + s.xRel * bandHalf));
            return (
              <div
                key={i}
                className="sun-sparkle"
                style={{
                  left: `${x}%`,
                  top: `${s.y}%`,
                  width: `${s.w}px`,
                  height: `${s.h}px`,
                  "--delay": `${s.delay}s`,
                  "--duration": `${s.duration}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* ── 해안 파도 (먼 파도) ── */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 6}%`, height: "5%", zIndex: 19 }}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-far"
          fill={waveColors.farFill}
          d="M0,30 C180,22 360,38 540,30 C720,22 900,38 1080,30 C1260,22 1440,30 1440,30 L1440,60 L0,60 Z"
        />
      </svg>

      {/* ── 해안 파도 (중간 파도) ── */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 3.8}%`, height: "6%", zIndex: 21 }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-back"
          fill={waveColors.backFill}
          d="M0,35 C360,50 720,20 1080,35 C1260,43 1380,28 1440,35 L1440,80 L0,80 Z"
        />
        <path
          className="animate-shore-wave-front"
          fill={waveColors.frontFill}
          d="M0,50 C240,38 480,62 720,50 C960,38 1200,62 1440,50 L1440,80 L0,80 Z"
        />
      </svg>

      {/* ── 해안 파도 (가장 앞 파도 + 포말) ── */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 1.5}%`, height: "4.5%", zIndex: 23 }}
        viewBox="0 0 1440 50"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-near"
          fill={waveColors.nearFill}
          d="M0,18 C120,12 240,24 360,18 C480,12 600,24 720,18 C840,12 960,24 1080,18 C1200,12 1320,24 1440,18 L1440,50 L0,50 Z"
        />
        <path
          className="animate-shore-wave-near"
          fill={waveColors.foamFill}
          d="M0,16 C120,10 240,22 360,16 C480,10 600,22 720,16 C840,10 960,22 1080,16 C1200,10 1320,22 1440,16 L1440,20 L0,20 Z"
        />
      </svg>

      {/* ── 파도 치기 (밀려왔다 빠지기) ── */}
      <div
        className="absolute w-full pointer-events-none overflow-hidden"
        style={{ top: `${BEACH_PCT * 100 - 3}%`, height: "10%", zIndex: 25 }}
      >
        <div className="wave-wash wave-wash-1" style={{ background: getWashBackground(theme, 1) }} />
        <div className="wave-wash wave-wash-2" style={{ background: getWashBackground(theme, 2) }} />
        <div className="wave-wash wave-wash-3" style={{ background: getWashBackground(theme, 3) }} />
      </div>
    </>
  );
}
