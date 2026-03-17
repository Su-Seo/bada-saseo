"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OceanBackground from "@/components/animations/OceanBackground";
import BottleThrow from "@/components/animations/BottleThrow";
import MessageInput from "@/components/ui/MessageInput";
import { useThrowMessage } from "@/components/ocean/hooks/useThrowMessage";

export default function ThrowPage() {
  const router = useRouter();
  const { content, setContent, stage, error, handleThrow, complete, reset } = useThrowMessage();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      <OceanBackground />

      <BottleThrow visible={stage === "throwing"} onComplete={complete} />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {stage === "write" && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="text-center mb-2">
                <h1 className="text-lg font-light tracking-widest text-white/80">고민 던지기</h1>
                <p className="text-xs text-white/40 mt-1">던지는 순간 내 화면에서 사라집니다</p>
              </div>

              <MessageInput value={content} onChange={setContent} disabled={false} />

              {error && <p className="text-xs text-red-400 text-center">{error}</p>}

              <button
                onClick={handleThrow}
                disabled={!content.trim()}
                className="w-full py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm tracking-widest hover:bg-white/25 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                유리병에 넣기 🍾
              </button>

              <button
                onClick={() => router.push("/")}
                className="text-xs text-white/30 hover:text-white/60 transition-colors text-center"
              >
                ← 돌아가기
              </button>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <p className="text-2xl">🌊</p>
              <p className="text-base font-light text-white/80 leading-relaxed">
                마음이 한결 가벼워졌길 바랍니다
              </p>
              <p className="text-xs text-white/40">누군가 당신의 마음을 읽을 거예요</p>

              <div className="flex flex-col gap-3 w-full mt-4">
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 text-sm text-white/70 hover:bg-white/20 transition-all"
                >
                  또 던지기
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  ← 처음으로
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
