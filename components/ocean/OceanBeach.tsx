"use client";

import { AnimatePresence } from "framer-motion";
import type { OceanTheme } from "@/lib/oceanTheme";
import BeachBottle from "./BeachBottle";
import type { BeachBottleItem } from "./hooks/useBeachBottles";
import BottleBag, { type BagType } from "./BottleBag";
import { BEACH_PCT } from "./constants";

const BOTTLE_BAG_POSITION_CHANGE_HEIGHT = 500;

const SHELLS = [
  { x: 9,  yOff: 1.8, type: "fan",    rot: -22, s: 1.0 },
  { x: 21, yOff: 4.5, type: "oval",   rot:  18, s: 0.75 },
  { x: 36, yOff: 2.2, type: "fan",    rot:   8, s: 0.85 },
  { x: 49, yOff: 5.8, type: "pebble", rot:   0, s: 1.0 },
  { x: 61, yOff: 1.5, type: "oval",   rot: -30, s: 0.9 },
  { x: 74, yOff: 3.8, type: "fan",    rot:  25, s: 0.8 },
  { x: 85, yOff: 2.0, type: "pebble", rot:   0, s: 1.1 },
  { x: 93, yOff: 4.2, type: "oval",   rot: -12, s: 0.7 },
] as const;

interface Props {
  theme: OceanTheme;
  beachBottles: BeachBottleItem[];
  shoreY: number;
  horizonY: number;
  onBeachThrow: (id: string) => void;
  onBeachRemove: (id: string) => void;
  isDaytime: boolean;
  viewH: number;
  unhearted: number;
  hearted: number;
  onTodayBagOpen: (type: BagType) => void;
}

export default function OceanBeach({
  theme,
  beachBottles,
  shoreY,
  horizonY,
  onBeachThrow,
  onBeachRemove,
  isDaytime,
  viewH,
  unhearted,
  hearted,
  onTodayBagOpen,
}: Props) {
  const shouldChangeBagPosition = viewH < BOTTLE_BAG_POSITION_CHANGE_HEIGHT;
  return (
    <>
      {/* ── 젖은 모래 ── */}
      <div
        className="absolute w-full pointer-events-none"
        style={{
          top: `${BEACH_PCT * 100}%`,
          height: "5%",
          zIndex: 3,
          background: `linear-gradient(180deg,
            rgba(${theme.wetSand[0]},${theme.wetSand[1]},${theme.wetSand[2]},0.9) 0%,
            rgba(${theme.sandLight[0]},${theme.sandLight[1]},${theme.sandLight[2]},0.6) 40%,
            transparent 100%
          )`,
        }}
      />
      <div
        className="absolute w-full pointer-events-none wet-sand-sheen"
        style={{ top: `${BEACH_PCT * 100}%`, height: "3%", zIndex: 4 }}
      />

      {/* ── 모래 텍스처 ── */}
      <div
        className="absolute w-full pointer-events-none sand-grain"
        style={{ top: `${BEACH_PCT * 100}%`, bottom: 0, zIndex: 2 }}
      />

      {/* ── 조개 & 자갈 ── */}
      {SHELLS.map((sh) => (
        <div
          key={`sh-${sh.x}`}
          className="absolute pointer-events-none"
          style={{
            left: `${sh.x}%`,
            top: `${BEACH_PCT * 100 + sh.yOff}%`,
            zIndex: 3,
            opacity: Math.min(1, (theme.sandLight[0] / 190) * 0.85),
            transition: "opacity 3s ease",
          }}
        >
          <svg
            width="18" height="18" viewBox="-9 -9 18 18"
            style={{ transform: `rotate(${sh.rot}deg) scale(${sh.s})`, display: "block" }}
          >
            {sh.type === "fan" && (
              <g>
                <path
                  d="M-5.5,5 C-7,-1 -3,-9 0,-9 C3,-9 7,-1 5.5,5 Z"
                  fill="rgba(238,218,188,0.78)"
                  stroke="rgba(195,162,118,0.55)"
                  strokeWidth="0.6"
                />
                <line x1="0" y1="5" x2="-4" y2="-5.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
                <line x1="0" y1="5" x2="0"  y2="-8.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
                <line x1="0" y1="5" x2="4"  y2="-5.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
              </g>
            )}
            {sh.type === "oval" && (
              <ellipse
                cx="0" cy="0" rx="4" ry="7"
                fill="rgba(230,202,168,0.72)"
                stroke="rgba(190,158,118,0.5)"
                strokeWidth="0.6"
              />
            )}
            {sh.type === "pebble" && (
              <ellipse
                cx="0" cy="0" rx="5.5" ry="4"
                fill="rgba(195,182,162,0.65)"
                stroke="rgba(165,152,132,0.4)"
                strokeWidth="0.5"
              />
            )}
          </svg>
        </div>
      ))}

      {/* ── 해변 유리병들 ── */}
      <AnimatePresence>
        {beachBottles.map((bb) => (
          <BeachBottle
            key={bb.id}
            id={bb.id}
            x={bb.x}
            y={bb.y}
            rotation={bb.rotation}
            shoreY={shoreY}
            horizonY={horizonY}
            onThrow={onBeachThrow}
            onRemove={onBeachRemove}
          />
        ))}
      </AnimatePresence>

      {/* ── 보자기 ── */}
      <div
        className={`fixed z-[28] flex items-end ${shouldChangeBagPosition ? "flex-row gap-2" : "flex-col"}`}
        style={shouldChangeBagPosition
          ? { left: "3%", bottom: "8px" }
          : { left: "3%", top: `calc(${BEACH_PCT * 100}% + 10px)` }}
      >
        <BottleBag
          type="unhearted"
          isDaytime={isDaytime}
          bottleCount={unhearted}
          onClick={() => onTodayBagOpen("unhearted")}
        />
        <BottleBag
          type="hearted"
          isDaytime={isDaytime}
          bottleCount={hearted}
          onClick={() => onTodayBagOpen("hearted")}
        />
      </div>
    </>
  );
}
