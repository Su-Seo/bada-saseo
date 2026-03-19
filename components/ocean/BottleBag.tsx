"use client";

import { motion } from "framer-motion";
import {
  getBottleBaseRgb,
  getBottleBodyStops,
  getBottleNeckStops,
  getBottleEdgeColor,
  BOTTLE_HIGHLIGHT,
  CORK_COLOR_DAY,
  CORK_COLOR_NIGHT,
  type GradientStop,
} from "@/lib/bottleTheme";

export type BagType = "unhearted" | "hearted";

interface Props {
  type: BagType;
  isDaytime: boolean;
  bottleCount?: number;
  onClick: () => void;
}

/**
 * 가로로 누운 유리병 — lib/bottleTheme 공유 색상 사용
 */
function HorizontalBottle({ x, y, rotate, isDaytime, uid }: {
  x: number; y: number; rotate: number; isDaytime: boolean; uid: string;
}) {
  const base = getBottleBaseRgb(null); // 기본 "초록"
  const bodyStops = getBottleBodyStops(base);
  const neckStops = getBottleNeckStops(base);
  const o = isDaytime ? 1 : 0.75;

  const toColor = (s: GradientStop) => `rgba(${s.r},${s.g},${s.b},${s.a * o})`;

  return (
    <g transform={`translate(${x},${y}) rotate(${rotate})`}>
      <defs>
        <linearGradient id={`bb-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          {bodyStops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={toColor(s)} />
          ))}
        </linearGradient>
        <linearGradient id={`bn-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          {neckStops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={toColor(s)} />
          ))}
        </linearGradient>
      </defs>

      {/* 몸통 */}
      <rect x="-6" y="-2.8" width="12" height="5.6" rx="2.2" ry="2.2"
        fill={`url(#bb-${uid})`}
        stroke={getBottleEdgeColor(base, 0.3 * o)}
        strokeWidth="0.4"
      />
      {/* 좌측 하이라이트 */}
      <rect x="-4.5" y="-2.2" width="2.4" height="4.2" rx="1"
        fill={BOTTLE_HIGHLIGHT}
        opacity={0.35 * o}
      />

      {/* 넥 */}
      <rect x="5.5" y="-1.3" width="5.5" height="2.6" rx="0.5"
        fill={`url(#bn-${uid})`}
        stroke={getBottleEdgeColor(base, 0.25 * o)}
        strokeWidth="0.3"
      />

      {/* 코르크 */}
      <rect x="10.8" y="-1.5" width="2.2" height="3" rx="0.5"
        fill={isDaytime ? CORK_COLOR_DAY : CORK_COLOR_NIGHT}
        opacity={o}
      />
    </g>
  );
}

/** 자루 안에 배치할 병 10개의 위치 정보 (아래층 → 중간층 → 위층 순) */
const BOTTLE_CONFIGS = [
  // 아래층 (3개)
  { x: 18, y: 30, rotate: 3   },
  { x: 34, y: 31, rotate: -16 },
  { x: 50, y: 30, rotate: 180 },
  // 중간층 (4개)
  { x: 14, y: 26, rotate: -14  },
  { x: 28, y: 27, rotate: 187  },
  { x: 42, y: 26, rotate: -202 },
  { x: 56, y: 27, rotate: 189  },
  // 위층 (3개)
  { x: 20, y: 22, rotate: 8    },
  { x: 36, y: 21, rotate: 5    },
  { x: 45, y: 22, rotate: -196 },
] as const;

const MAX_VISUAL = BOTTLE_CONFIGS.length; // 10

function BagSVG({ type, isDaytime, bottleCount }: { type: BagType; isDaytime: boolean; bottleCount?: number }) {
  const isHearted = type === "hearted";
  const gid = `bag-${type}`;
  const visibleCount = bottleCount === undefined
    ? MAX_VISUAL
    : Math.min(MAX_VISUAL, Math.max(0, bottleCount));

  // hearted: 분홍, unhearted: 갈색 — 반투명 RGBA 톤
  const c = isHearted
    ? {
        body:     isDaytime ? "rgba(230,140,170,0.50)" : "rgba(140,60,90,0.50)",
        bodyDark: isDaytime ? "rgba(200,110,140,0.55)" : "rgba(110,40,65,0.55)",
        bodyEdge: isDaytime ? "rgba(180,90,120,0.35)"  : "rgba(90,35,55,0.35)",
        highlight:isDaytime ? "rgba(255,200,220,0.40)" : "rgba(180,100,130,0.30)",
        rim:      isDaytime ? "rgba(220,130,160,0.60)" : "rgba(130,55,80,0.55)",
        rimHi:    isDaytime ? "rgba(255,210,225,0.50)" : "rgba(180,100,130,0.40)",
        inside:   isDaytime ? "rgba(150,50,80,0.70)"   : "rgba(60,15,30,0.75)",
        heart:    isDaytime ? "rgba(224,48,96,0.75)"    : "rgba(192,32,72,0.70)",
      }
    : {
        body:     isDaytime ? "rgba(200,170,120,0.50)" : "rgba(110,85,45,0.50)",
        bodyDark: isDaytime ? "rgba(170,140,90,0.55)"  : "rgba(85,65,30,0.55)",
        bodyEdge: isDaytime ? "rgba(150,120,70,0.35)"  : "rgba(70,50,20,0.35)",
        highlight:isDaytime ? "rgba(235,210,170,0.40)" : "rgba(150,120,70,0.30)",
        rim:      isDaytime ? "rgba(190,160,100,0.60)" : "rgba(100,75,35,0.55)",
        rimHi:    isDaytime ? "rgba(240,220,180,0.50)" : "rgba(160,130,80,0.40)",
        inside:   isDaytime ? "rgba(100,65,25,0.70)"   : "rgba(35,18,5,0.75)",
        heart:    isDaytime ? "rgba(154,120,64,0.65)"   : "rgba(90,72,40,0.60)",
      };

  return (
    <svg viewBox="0 0 72 82" width="60" height="70" aria-hidden>
      <defs>
        {/* 몸통 상하 그라디언트 */}
        <linearGradient id={`${gid}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="30%"  stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.15" />
        </linearGradient>
        {/* 좌우 입체감 */}
        <linearGradient id={`${gid}-side`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="black" stopOpacity="0.12" />
          <stop offset="35%"  stopColor="black" stopOpacity="0" />
          <stop offset="65%"  stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.08" />
        </linearGradient>
        {/* 하이라이트 */}
        <linearGradient id={`${gid}-hi`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* 자루 내부 클립 — 몸통 + 입구 타원 */}
        <clipPath id={`${gid}-clip`}>
          <path d="M8,24 L4,70 Q4,78 36,78 Q68,78 68,70 L64,24 Z" />
          <ellipse cx="36" cy="27" rx="28" ry="10" />
        </clipPath>
      </defs>

      {/* ── 자루 몸통 ── */}
      <path
        d="M8,24 L4,70 Q4,78 36,78 Q68,78 68,70 L64,24 Z"
        fill={c.body}
        stroke={c.bodyEdge}
        strokeWidth="1"
      />
      {/* 상하 입체감 */}
      <path d="M8,24 L4,70 Q4,78 36,78 Q68,78 68,70 L64,24 Z" fill={`url(#${gid}-body)`} />
      {/* 좌우 입체감 */}
      <path d="M8,24 L4,70 Q4,78 36,78 Q68,78 68,70 L64,24 Z" fill={`url(#${gid}-side)`} />
      {/* 하이라이트 반사 */}
      <path
        d="M12,28 L10,65 Q20,70 28,70 L24,26 Z"
        fill={c.highlight}
        opacity="0.7"
      />

      {/* ── 자루 입구 ── */}
      {/* 안쪽 불투명 배경 */}
      <ellipse cx="36" cy="27" rx="28" ry="10" fill={c.inside} />

      {/* ── 가로로 쌓인 유리병들 (자루 안으로 클립) ── */}
      <g clipPath={`url(#${gid}-clip)`}>
        {BOTTLE_CONFIGS.slice(0, visibleCount).map((cfg, i) => (
          <HorizontalBottle
            key={i}
            x={cfg.x} y={cfg.y} rotate={cfg.rotate}
            isDaytime={isDaytime}
            uid={`${gid}-b${i}`}
          />
        ))}
      </g>

      {/* ── 테두리 — 부드러운 림 ── */}
      <ellipse cx="36" cy="24" rx="29" ry="10" fill="none" stroke={c.rim} strokeWidth="3" />
      {/* 테두리 위쪽 하이라이트 */}
      <path
        d="M9,24 Q20,15 36,15 Q52,15 63,24"
        fill="none" stroke={c.rimHi} strokeWidth="1.5" strokeLinecap="round"
      />

      {/* ── 하트 장식 ── */}
      {isHearted ? (
        <path
          d="M36,68
             C28,62 20,56 20,49
             C20,45 23,42 27,42
             C30,42 33,44 36,47
             C39,44 42,42 45,42
             C49,42 52,45 52,49
             C52,56 44,62 36,68 Z"
          fill={c.heart}
        />
      ) : (
        <path
          d="M36,68
             C28,62 20,56 20,49
             C20,45 23,42 27,42
             C30,42 33,44 36,47
             C39,44 42,42 45,42
             C49,42 52,45 52,49
             C52,56 44,62 36,68 Z"
          fill="none"
          stroke={c.bodyDark}
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.50"
        />
      )}
    </svg>
  );
}

export default function BottleBag({ type, isDaytime, bottleCount, onClick }: Props) {
  const label = type === "hearted" ? "공감받은 병들" : "외로운 병들";
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 cursor-pointer select-none"
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 340, damping: 20 }}
      aria-label={`${label} 보기`}
    >
      <BagSVG type={type} isDaytime={isDaytime} bottleCount={bottleCount} />
    </motion.button>
  );
}
