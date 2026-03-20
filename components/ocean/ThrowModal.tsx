"use client";

import { AnimatePresence, motion } from "framer-motion";
import MessageInput from "@/components/ui/MessageInput";
import GlassBottle from "./GlassBottle";
import BottleCustomizer from "./BottleCustomizer";
import { useThrowMessage } from "./hooks/useThrowMessage";

interface Props {
  onClose: () => void;
  onThrowSuccess?: (messageId: string, bottleColor: string | null) => void;
}

export default function ThrowModal({ onClose, onThrowSuccess }: Props) {
  const { content, setContent, options, setOptions, stage, error, handleThrow, complete, reset } =
    useThrowMessage();

  const onThrow = async () => {
    const result = await handleThrow();
    if (result) {
      onThrowSuccess?.(result.messageId, result.bottleColor);
      setTimeout(complete, 1600);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={stage === "write" ? onClose : undefined}
      />

      <motion.div
        className="relative z-10 w-full sm:max-w-sm mx-4 mb-4 sm:mb-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl"
        initial={{ y: 60, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {stage === "write" && (
            <motion.div
              key="write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="text-center">
                <p className="text-xs text-white/40 tracking-[0.3em] uppercase mb-1">
                  고민 던지기
                </p>
                <p className="text-xs text-white/30">던지는 순간 내 화면에서 사라집니다</p>
              </div>

              <BottleCustomizer
                value={options}
                onChange={(updates) => setOptions((prev) => ({ ...prev, ...updates }))}
                size="md"
              />

              <MessageInput value={content} onChange={setContent} disabled={false} />

              {error && <p className="text-xs text-red-400 text-center">{error}</p>}

              <button
                onClick={onThrow}
                disabled={!content.trim()}
                className="w-full py-3 rounded-2xl bg-white/20 border border-white/30 text-white text-sm tracking-widest hover:bg-white/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                유리병에 넣어 던지기
              </button>

              <button
                onClick={onClose}
                className="text-xs text-white/30 hover:text-white/60 transition-colors text-center"
              >
                취소
              </button>
            </motion.div>
          )}

          {stage === "throwing" && (
            <motion.div
              key="throwing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-10"
            >
              <motion.div
                animate={{
                  x: [0, 40, 120],
                  y: [0, -60, -160],
                  rotate: [0, 25, 55],
                  opacity: [1, 0.9, 0],
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <GlassBottle
                  size={3.2}
                  hasNote
                  bottleColor={options.bottleColor}
                  paperStyle={options.paperStyle}
                />
              </motion.div>
              <p className="text-sm text-white/50 tracking-wider">바다로 던지는 중...</p>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-4 text-center"
            >
              <motion.p
                className="text-4xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🌊
              </motion.p>
              <p className="text-sm font-light text-white/80 leading-relaxed">
                마음이 한결 가벼워졌길 바랍니다
              </p>
              <p className="text-xs text-white/40">누군가 당신의 마음을 읽을 거예요</p>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70 hover:bg-white/20 transition-all"
                >
                  또 던지기
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70 hover:bg-white/20 transition-all"
                >
                  바다로 돌아가기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
