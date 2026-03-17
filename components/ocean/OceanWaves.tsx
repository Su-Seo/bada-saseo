"use client";

import type { OceanTheme } from "@/lib/oceanTheme";
import { getWashBackground, getWaveColors } from "@/lib/oceanTheme";
import { HORIZON_PCT, SHORE_PCT, BEACH_PCT } from "./constants";

interface Props {
  theme: OceanTheme;
  waveColors: ReturnType<typeof getWaveColors>;
}

export default function OceanWaves({ theme, waveColors }: Props) {
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
