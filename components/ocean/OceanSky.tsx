"use client";

import type { OceanTheme } from "@/lib/oceanTheme";
import { getMoonlightColor } from "@/lib/oceanTheme";
import type { Star } from "./hooks/useStars";
import { HORIZON_PCT } from "./constants";

interface Props {
  theme: OceanTheme;
  stars: Star[];
  sunPos: { x: number; y: number } | null;
}

export default function OceanSky({ theme, stars, sunPos }: Props) {
  return (
    <>
      {/* ── 별 ── */}
      {theme.starOpacity > 0.01 &&
        stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: theme.starOpacity,
              ["--twinkle-duration" as string]: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              transition: "opacity 3s ease",
            }}
          />
        ))}

      {/* ── 달 ── */}
      {theme.moonOpacity > 0.01 && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              right: "9%",
              top: "4%",
              width: 180,
              height: 180,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle, rgba(200,210,240,0.06) 0%, transparent 70%)",
              transition: "opacity 3s ease",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              right: "13%",
              top: "8%",
              width: 38,
              height: 38,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle at 35% 35%, #e8e4d8, #d4cfc0 50%, #bab5a5 80%, #a09a88)",
              boxShadow:
                "0 0 12px rgba(220,215,195,0.35), 0 0 40px rgba(200,195,175,0.1)",
              transition: "opacity 3s ease",
            }}
          />
        </>
      )}

      {/* ── 태양 ── */}
      {sunPos && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 220,
              height: 220,
              opacity: theme.sunOpacity * 0.35,
              background:
                "radial-gradient(circle, rgba(255,240,160,0.5) 0%, rgba(255,210,80,0.2) 35%, transparent 70%)",
              transition: "opacity 3s ease, left 3s ease, top 3s ease",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 46,
              height: 46,
              opacity: theme.sunOpacity,
              background:
                "radial-gradient(circle at 42% 38%, #fffde8, #ffe966 40%, #ffd020 70%, #ffb800)",
              boxShadow:
                "0 0 18px rgba(255,220,60,0.7), 0 0 55px rgba(255,190,40,0.3)",
              transition: "opacity 3s ease, left 3s ease, top 3s ease",
            }}
          />
        </>
      )}

      {/* ── 달빛 반사 ── */}
      {theme.moonOpacity > 0.01 && (
        <div
          className="absolute pointer-events-none"
          style={{
            right: "8%",
            top: `${HORIZON_PCT * 100 + 1}%`,
            width: "12%",
            height: "28%",
            background: getMoonlightColor(theme),
            filter: "blur(8px)",
            transition: "opacity 3s ease",
          }}
        />
      )}

      {/* ── 수평선 발광 ── */}
      <div
        className="absolute w-full pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 4}%`,
          height: "8%",
          opacity: theme.horizonGlowOpacity,
          background:
            "radial-gradient(ellipse 130% 100% at 50% 80%, rgba(40,70,120,0.1) 0%, transparent 65%)",
          transition: "opacity 3s ease",
        }}
      />
      <div
        className="absolute w-full horizon-glow pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 0.3}%`,
          height: "0.8%",
          opacity: theme.horizonGlowOpacity,
          background:
            "linear-gradient(180deg, transparent 10%, rgba(60,100,160,0.1) 50%, transparent 90%)",
          transition: "opacity 3s ease",
        }}
      />
    </>
  );
}
