"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface BottleData {
  id: string;
  messageId: string;
  x: number;       // 화면 좌측 기준 % (10~85)
  xDrift: number;  // 표류 중 수평 이동량 (px)
  duration: number; // 수평선 → 해안 이동 시간 (초)
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
      <div
        className={arrived ? "bottle-arrived" : "bottle-drifting"}
        style={{ fontSize: "2.4rem" }}
      >
        🍾
      </div>
      {arrived && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/60 mt-1 whitespace-nowrap"
          style={{ fontSize: "0.55rem", letterSpacing: "0.1em" }}
        >
          열어보기
        </motion.p>
      )}
    </motion.div>
  );
}
