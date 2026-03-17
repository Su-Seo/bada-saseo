"use client";

import { motion, AnimatePresence } from "framer-motion";

type Stage = "idle" | "floating" | "open";

interface Props {
  stage: Stage;
  onBottleClick: () => void;
}

export default function BottlePick({ stage, onBottleClick }: Props) {
  return (
    <AnimatePresence>
      {stage === "floating" && (
        <motion.button
          key="bottle"
          initial={{ x: 300, y: 200, opacity: 0 }}
          animate={{
            x: 0,
            y: [0, -12, 0, -8, 0],
            opacity: 1,
            transition: {
              x: { duration: 1, ease: "easeOut" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 },
              opacity: { duration: 0.5 },
            },
          }}
          exit={{ x: 400, y: 200, opacity: 0, transition: { duration: 0.8 } }}
          onClick={onBottleClick}
          className="text-6xl cursor-pointer select-none hover:scale-110 transition-transform focus:outline-none"
          title="유리병을 열어보세요"
          aria-label="유리병 열기"
        >
          🍾
        </motion.button>
      )}
    </AnimatePresence>
  );
}
