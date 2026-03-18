"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSplash } from "@/lib/sounds";
import GlassBottle from "./GlassBottle";

interface Props {
  throwX: number;
  throwY: number;
  horizonY: number;
  bottleColor?: string;
  paperStyle?: string;
  onComplete: () => void;
}

/** 병 던지기 → 수평선 도달 → 스플래시 애니메이션 */
export default function BeachThrowAnimation({
  throwX,
  throwY,
  horizonY,
  bottleColor,
  paperStyle,
  onComplete,
}: Props) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowSplash(true);
      playSplash();
    }, 1050);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <motion.div
        className="fixed z-[85] pointer-events-none"
        style={{ left: throwX, top: throwY, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        animate={{ scale: 0.1, opacity: 0, y: horizonY - throwY, rotate: 60 }}
        transition={{ duration: 1.4, ease: [0.15, 0.75, 0.35, 1] }}
        onAnimationComplete={onComplete}
      >
        <GlassBottle size={2.8} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
      </motion.div>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="fixed z-[86] pointer-events-none"
            style={{ left: throwX, top: horizonY, translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.45 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute border border-white/50 rounded-full"
                style={{ translateX: "-50%", translateY: "-50%" }}
                initial={{ width: 2, height: 1 }}
                animate={{ width: 10 + i * 14, height: 3 + i * 3.5, opacity: [0.8, 0] }}
                transition={{ duration: 0.75, delay: i * 0.1, ease: "easeOut" }}
              />
            ))}
            {[
              { x: -7, y: -12, d: 0.0 },
              { x: -2, y: -16, d: 0.03 },
              { x: 3, y: -14, d: 0.05 },
              { x: 8, y: -10, d: 0.02 },
              { x: -11, y: -8, d: 0.06 },
              { x: 10, y: -9, d: 0.04 },
            ].map((drop, i) => (
              <motion.div
                key={`drop-${i}`}
                className="absolute w-[2px] h-[2px] rounded-full bg-white/70"
                style={{ translateX: "-50%", translateY: "-50%" }}
                initial={{ x: 0, y: 0, opacity: 0.9 }}
                animate={{ x: drop.x, y: drop.y, opacity: 0 }}
                transition={{ duration: 0.38, delay: drop.d, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
