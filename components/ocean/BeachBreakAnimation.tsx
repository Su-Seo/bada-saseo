"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { playBreakingBottle } from "@/lib/sounds";
import { SPLASH_DELAY_MS } from "./constants";

interface Props {
  throwX: number;
  throwY: number;
  errorMessage: string;
  onComplete: () => void;
}

// 유리 파편 — 각도(deg), 거리(px), 회전(deg), 크기 배율
const SHARDS = [
  { angle: -95, dist: 72, rotate: 120,  w: 8,  h: 3 },
  { angle: -65, dist: 88, rotate: -85,  w: 5,  h: 5 },
  { angle: -40, dist: 64, rotate: 200,  w: 10, h: 3 },
  { angle: -15, dist: 80, rotate: -140, w: 6,  h: 4 },
  { angle:  15, dist: 68, rotate: 170,  w: 9,  h: 2 },
  { angle:  40, dist: 90, rotate: -60,  w: 5,  h: 5 },
  { angle:  65, dist: 75, rotate: 110,  w: 8,  h: 3 },
  { angle:  95, dist: 70, rotate: -190, w: 6,  h: 4 },
  { angle: 120, dist: 60, rotate: 80,   w: 7,  h: 2 },
  { angle:-120, dist: 66, rotate: -100, w: 5,  h: 5 },
  { angle: -80, dist: 50, rotate: 150,  w: 4,  h: 4 },
  { angle:  80, dist: 55, rotate: -170, w: 4,  h: 3 },
];

export default function BeachBreakAnimation({ throwX, throwY, errorMessage, onComplete }: Props) {
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  useEffect(() => {
    if (!isPlayingSound) {
      playBreakingBottle();
      setIsPlayingSound(true);
    }
    const t = setTimeout(onComplete, SPLASH_DELAY_MS + 500);
    return () => clearTimeout(t);
  }, [onComplete, isPlayingSound]);

  return (
    <div className="fixed inset-0 z-[85] pointer-events-none">
      {/* 섬광 */}
      <motion.div
        className="absolute inset-0 bg-white/30"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* 유리 파편 */}
      {SHARDS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * s.dist;
        const ty = Math.sin(rad) * s.dist + 30; // 중력 느낌
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: throwX,
              top: throwY,
              translateX: "-50%",
              translateY: "-50%",
              width: s.w,
              height: s.h,
              background: "rgba(180, 230, 255, 0.75)",
              boxShadow: "0 0 4px rgba(150,220,255,0.6)",
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: tx, y: ty, rotate: s.rotate, opacity: 0 }}
            transition={{
              duration: 0.7 + i * 0.03,
              delay: 0.05 + i * 0.015,
              ease: [0.1, 0.6, 0.4, 1],
            }}
          />
        );
      })}

      {/* 작은 반짝임 입자 */}
      {[...Array(6)].map((_, i) => {
        const a = (i / 6) * 360;
        const r = 25 + (i % 3) * 10;
        const rad = (a * Math.PI) / 180;
        return (
          <motion.div
            key={`spark-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{ left: throwX, top: throwY, translateX: "-50%", translateY: "-50%" }}
            initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
            animate={{ x: Math.cos(rad) * r, y: Math.sin(rad) * r, opacity: 0, scale: 0 }}
            transition={{ duration: 0.45, delay: i * 0.02, ease: "easeOut" }}
          />
        );
      })}

      {/* 에러 메시지 */}
      <motion.div
        className="absolute flex flex-col items-center gap-1 text-center"
        style={{ left: throwX, top: throwY + 36, translateX: "-50%" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
        transition={{ duration: 2.4, times: [0, 0.12, 0.75, 1] }}
      >
        <span className="text-white/90 text-[0.65rem] tracking-wide whitespace-nowrap drop-shadow-md">
          편지를 담은 병이 깨졌어요
        </span>
        <span className="text-white/50 text-[0.55rem] whitespace-nowrap">
          {errorMessage}
        </span>
      </motion.div>
    </div>
  );
}
