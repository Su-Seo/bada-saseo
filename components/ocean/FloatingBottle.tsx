"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import GlassBottle from "./GlassBottle";

export interface BottleData {
  id: string;
  messageId: string;
  x: number;
  xDrift: number;
  duration: number;
  bottleColor?: string | null;
}

interface Props {
  bottle: BottleData;
  horizonY: number; // 수평선 y 좌표 (px)
  shoreY: number;   // 해안선 y 좌표 (px)
  onClick: (data: { messageId: string; bottleId: string }) => void;
  onExpire: (id: string) => void;
}

export default function FloatingBottle({
  bottle,
  horizonY,
  shoreY,
  onClick,
  onExpire,
}: Props) {
  const [arrived, setArrived] = useState(false);
  const expireTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const drift = shoreY - horizonY;

  useEffect(() => {
    return () => {
      if (expireTimer.current) clearTimeout(expireTimer.current);
    };
  }, []);

  const handleArrival = () => {
    setArrived(true);
    expireTimer.current = setTimeout(() => {
      onExpire(bottle.id);
    }, 22_000);
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        left: `${bottle.x}%`,
        top: horizonY,
        translateX: "-50%",
        zIndex: arrived ? 28 : 18,
        cursor: "pointer",
        userSelect: "none",
      }}
      initial={{ y: 0, scale: 0.12, opacity: 0, x: 0 }}
      animate={{
        y: drift,
        scale: 1.0,
        opacity: 1,
        x: bottle.xDrift,
      }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.6 } }}
      transition={{
        duration: bottle.duration,
        ease: "linear",
        opacity: { duration: 4, ease: "easeIn" },
        scale: { duration: bottle.duration, ease: "easeIn" },
        x: { duration: bottle.duration, ease: "easeInOut" },
      }}
      onAnimationComplete={handleArrival}
      whileHover={arrived ? { scale: 1.18, transition: { duration: 0.2 } } : undefined}
      onClick={() => onClick({ messageId: bottle.messageId, bottleId: bottle.id })}
    >
      <div className={arrived ? "bottle-arrived" : "bottle-drifting"}>
        <GlassBottle size={2.4} hasNote bottleColor={bottle.bottleColor} />
      </div>
    </motion.div>
  );
}
