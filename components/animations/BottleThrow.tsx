"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export default function BottleThrow({ visible, onComplete }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: 600, y: -300, rotate: 60, opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.4, ease: "easeIn" }}
            onAnimationComplete={onComplete}
            className="text-7xl select-none"
          >
            🍾
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
