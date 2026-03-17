"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageInput from "@/components/ui/MessageInput";
import GlassBottle from "./GlassBottle";
import { TAGS, Tag, BOTTLE_COLORS, BottleColor, PAPER_STYLES, PaperStyle, BOTTLE_COLOR_MAP, PAPER_STYLE_MAP } from "@/lib/constants";

type Stage = "write" | "throwing" | "done";

interface Props {
  onClose: () => void;
}

export default function ThrowModal({ onClose }: Props) {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<Tag | null>(null);
  const [bottleColor, setBottleColor] = useState<BottleColor>("초록");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("기본");
  const [stage, setStage] = useState<Stage>("write");
  const [error, setError] = useState("");

  const handleThrow = async () => {
    if (!content.trim()) {
      setError("마음을 담아 적어주세요.");
      return;
    }
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, tag, bottleColor, paperStyle }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "오류가 발생했습니다.");
      return;
    }

    setStage("throwing");
    setTimeout(() => setStage("done"), 1600);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 백드롭 */}
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
                <p className="text-xs text-white/30">
                  던지는 순간 내 화면에서 사라집니다
                </p>
              </div>

              {/* 미리보기 + 커스터마이징 */}
              <div className="flex gap-3 items-start">
                {/* 병 미리보기 */}
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <motion.div
                    key={bottleColor + paperStyle}
                    initial={{ scale: 0.85, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassBottle size={3.2} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
                  </motion.div>
                  <span className="text-[0.52rem] text-white/25 tracking-wide">{bottleColor} · {PAPER_STYLE_MAP[paperStyle].label}</span>
                </div>

                {/* 선택 옵션들 */}
                <div className="flex-1 flex flex-col gap-2.5">
                  {/* 태그 */}
                  <div>
                    <p className="text-[0.6rem] text-white/25 mb-1 tracking-wider">태그</p>
                    <div className="flex flex-wrap gap-1">
                      {TAGS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(tag === t ? null : t)}
                          className={`px-2 py-0.5 rounded-full text-[0.6rem] transition-all border ${
                            tag === t
                              ? "bg-white/30 border-white/50 text-white"
                              : "bg-white/5 border-white/15 text-white/40 hover:bg-white/15 hover:text-white/70"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 병 색상 */}
                  <div>
                    <p className="text-[0.6rem] text-white/25 mb-1 tracking-wider">병 색상</p>
                    <div className="flex flex-wrap gap-1.5">
                      {BOTTLE_COLORS.map((c) => {
                        const { r, g, b } = BOTTLE_COLOR_MAP[c];
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBottleColor(c)}
                            title={c}
                            className={`w-5 h-5 rounded-full transition-all border-2 ${
                              bottleColor === c ? "border-white/80 scale-125" : "border-white/20"
                            }`}
                            style={{ background: `rgba(${r},${g},${b},0.85)` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 편지지 */}
                  <div>
                    <p className="text-[0.6rem] text-white/25 mb-1 tracking-wider">편지지</p>
                    <div className="flex gap-1.5">
                      {PAPER_STYLES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPaperStyle(p)}
                          title={PAPER_STYLE_MAP[p].label}
                          className={`flex flex-col items-center gap-0.5 transition-all`}
                        >
                          <span
                            className={`w-5 h-5 rounded border-2 block ${
                              paperStyle === p ? "border-white/80 scale-125" : "border-white/20"
                            }`}
                            style={{ background: PAPER_STYLE_MAP[p].note }}
                          />
                          <span className="text-[0.45rem] text-white/30">{PAPER_STYLE_MAP[p].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <MessageInput
                value={content}
                onChange={setContent}
                disabled={false}
              />

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <button
                onClick={handleThrow}
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
                <GlassBottle size={3.2} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
              </motion.div>
              <p className="text-sm text-white/50 tracking-wider">
                바다로 던지는 중...
              </p>
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
              <p className="text-xs text-white/40">
                누군가 당신의 마음을 읽을 거예요
              </p>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setContent("");
                    setStage("write");
                  }}
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
