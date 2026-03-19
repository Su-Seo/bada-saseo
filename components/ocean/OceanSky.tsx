"use client";

import { useMemo } from "react";
import type { OceanTheme } from "@/lib/oceanTheme";
import { getMoonlightColor } from "@/lib/oceanTheme";
import type { Star } from "./hooks/useStars";
import { HORIZON_PCT } from "./constants";

interface Props {
  theme: OceanTheme;
  stars: Star[];
  sunPos: { x: number; y: number } | null;
  moonPos: { x: number; y: number } | null;
}

// ── 구름 생성 ─────────────────────────────────────────

interface Bump { x: number; y: number; w: number; h: number }
interface CloudData {
  id: number;
  top: number;
  duration: number;
  delay: number;
  W: number;
  H: number;
  bumps: Bump[];
  opacity: number;
  blur: number;
}

// Seeded PRNG (deterministic) to avoid server/client hydration mismatches
function seededRandom(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function genClouds(count: number): CloudData[] {
  // fixed seed ensures the same clouds are generated on server and client
  const rand = seededRandom(1234567);

  return Array.from({ length: count }, (_, i) => {
    const size     = 0.42 + rand() * 0.72;    // 0.42 ~ 1.14
    const W        = Math.round(115 * size);          // 48 ~ 132 px
    const H        = Math.round(38 * size);
    const top      = 14 + rand() * 18;
    const duration = 420 + rand() * 180;
    const screenLeft = 4 + rand() * 88;
    const delay    = -((110 - screenLeft) / 220) * duration;
    const opacity  = 0.48 + rand() * 0.22;    // 0.48 ~ 0.70
    const blur     = 4 + rand() * 5;           // 4 ~ 9 px

    // 봉긋한 원형 덩어리들
    const n = 3 + Math.floor(rand() * 3);      // 3 ~ 5
    const bumps: Bump[] = [];
    for (let b = 0; b < n; b++) {
      const t = n === 1 ? 0.5 : b / (n - 1);
      const bh = H * (0.48 + rand() * 0.38);
      const bw = bh * (0.88 + rand() * 0.52);
      const bx = W * 0.04 + t * W * 0.75 - bw / 2 + (rand() - 0.5) * W * 0.1;
      const by = H * 0.52 - bh * 0.72;
      bumps.push({ x: bx, y: by, w: bw, h: bh });
    }

    return { id: i, top, duration, delay, W, H, bumps, opacity, blur };
  });
}

function CloudShape({ cloud }: { cloud: CloudData }) {
  const { W, H, bumps, opacity, blur } = cloud;
  return (
    <div style={{ position: "relative", width: W, height: H, filter: `blur(${blur}px)`, opacity }}>
      {/* 바닥 몸체 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: H * 0.48, background: "white", borderRadius: H * 0.24,
      }} />
      {/* 봉긋한 위쪽 */}
      {bumps.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          left: b.x, top: b.y, width: b.w, height: b.h,
          borderRadius: "50%", background: "white",
        }} />
      ))}
    </div>
  );
}

const PLANET_TRANSITION = "opacity 1s ease, left 1s ease, top 1s ease";

// ── 컴포넌트 ──────────────────────────────────────────

export default function OceanSky({ theme, stars, sunPos, moonPos }: Props) {
  // 마운트 시 1회만 생성 — 페이지 리로드마다 다른 구름
  const clouds = useMemo(() => genClouds(6), []);

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
      {theme.moonOpacity > 0.01 && moonPos && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${moonPos.x}%`,
              top: `${moonPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 180,
              height: 180,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle, rgba(200,210,240,0.06) 0%, transparent 70%)",
              transition: PLANET_TRANSITION,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: `${moonPos.x}%`,
              top: `${moonPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 38,
              height: 38,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle at 35% 35%, #e8e4d8, #d4cfc0 50%, #bab5a5 80%, #a09a88)",
              boxShadow:
                "0 0 12px rgba(220,215,195,0.35), 0 0 40px rgba(200,195,175,0.1)",
              transition: PLANET_TRANSITION,
            }}
          />
        </>
      )}

      {/* ── 구름 (낮에만) ── */}
      <div
        className="absolute pointer-events-none overflow-hidden"
        style={{
          inset: 0,
          height: `${HORIZON_PCT * 100}%`,
          opacity: Math.min(1, Math.max(0, (theme.sunOpacity - 0.45) * 2.2)),
          transition: "opacity 3s ease",
        }}
      >
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute"
            style={{
              top: `${cloud.top}%`,
              left: "110%",
              animationName: "cloud-drift",
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
            <CloudShape cloud={cloud} />
          </div>
        ))}
      </div>

      {/* ── 태양 ── */}
      {sunPos && theme.sunOpacity > 0.01 && (
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
              transition: PLANET_TRANSITION,
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
              transition: PLANET_TRANSITION,
            }}
          />
        </>
      )}

      {/* ── 달빛 반사 ── */}
      {theme.moonOpacity > 0.01 && moonPos && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${moonPos.x}%`,
            transform: "translateX(-50%)",
            top: `${HORIZON_PCT * 100 + 1}%`,
            width: "12%",
            height: "28%",
            background: getMoonlightColor(theme),
            filter: "blur(8px)",
            transition: "opacity 3s ease, left 3s ease",
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
