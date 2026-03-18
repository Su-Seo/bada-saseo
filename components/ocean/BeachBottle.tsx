"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_LENGTH } from "@/lib/constants";
import { useBeachCompose } from "./hooks/useBeachCompose";
import GlassBottle from "./GlassBottle";
import BottleCustomizer from "./BottleCustomizer";
import BeachThrowAnimation from "./BeachThrowAnimation";
import BeachBreakAnimation from "./BeachBreakAnimation";

interface Props {
  id: string;
  x: number;
  y: number;
  rotation: number;
  shoreY: number;
  horizonY: number;
  /** 던지기 완료 후 병 제거를 부모에 알림 */
  onThrow: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function BeachBottle({
  id,
  x,
  y,
  rotation,
  shoreY,
  horizonY,
  onThrow,
  onRemove,
}: Props) {
  const compose = useBeachCompose();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [throwData, setThrowData] = useState<{ x: number; y: number } | null>(null);

  // ── 드래그 ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (compose.state !== "filled") return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (e.clientY < shoreY) {
      setThrowData({ x: e.clientX, y: e.clientY });
      const ok = await compose.submit();
      if (!ok) return; // throwData 유지 — broken 상태에서 BeachBreakAnimation이 사용
      onThrow(id);
    } else {
      setDragPos(null);
    }
  };

  // ── 깨지기 애니메이션 ──
  if (compose.state === "broken" && throwData) {
    // 0.9s 비행 후 깨지므로, easing [0.15, 0.75, 0.35, 1] 특성상 약 80% 지점에 위치    
    const breakY = throwData.y + (horizonY - throwData.y) * 0.8;
    return (
      <BeachBreakAnimation
        throwX={throwData.x}
        throwY={breakY}
        errorMessage={compose.breakError}
        onComplete={() => { compose.reset(); onRemove(id); }}
      />
    );
  }

  // ── 던지기 애니메이션 ──
  if (compose.state === "throwing" && throwData) {
    return (
      <BeachThrowAnimation
        throwX={throwData.x}
        throwY={throwData.y}
        horizonY={horizonY}
        bottleColor={compose.options.bottleColor}
        paperStyle={compose.options.paperStyle}
        onComplete={() => onRemove(id)}
      />
    );
  }

  return (
    <>
      {/* ── 해변 병 ── */}
      {!isDragging && (
        <motion.div
          className="absolute"
          style={{ left: `${x}%`, bottom: `${y}%`, zIndex: 32 }}
          initial={{ opacity: 0, scale: 0, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }}
        >
          <div
            onClick={compose.state === "empty" ? compose.open : undefined}
            onPointerDown={compose.state === "filled" ? handlePointerDown : undefined}
            className="relative"
            style={{ touchAction: "none", cursor: compose.state === "filled" ? "grab" : "pointer" }}
          >
            <span
              className={compose.state === "filled" ? "beach-bottle-filled" : "beach-bottle-empty"}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <GlassBottle
                size={2.2}
                hasNote={compose.state === "filled"}
                bottleColor={compose.state === "filled" ? compose.options.bottleColor : undefined}
                paperStyle={compose.state === "filled" ? compose.options.paperStyle : undefined}
              />
            </span>
          </div>

          {/* ── 인라인 글쓰기 카드 ── */}
          <AnimatePresence>
            {compose.state === "writing" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.92 }}
                className="absolute bottom-full mb-3 bg-black/55 backdrop-blur-xl border border-white/20 rounded-2xl p-3 text-white"
                style={{
                  zIndex: 38,
                  width: "16rem",
                  left: "50%",
                  transform: `translateX(${x < 22 ? "-15%" : x > 78 ? "-85%" : "-50%"})`,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <BottleCustomizer
                  value={compose.options}
                  onChange={compose.updateOptions}
                  size="sm"
                />

                <textarea
                  value={compose.content}
                  onChange={(e) => compose.setContent(e.target.value)}
                  maxLength={MAX_LENGTH}
                  placeholder="마음을 적어보세요..."
                  className="w-full h-20 resize-none rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 p-2 text-xs leading-relaxed focus:outline-none focus:border-white/40 transition-colors mt-4"
                  autoFocus
                />

                {compose.error && <p className="text-[0.6rem] text-red-400 mt-1">{compose.error}</p>}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.55rem] text-white/25">{compose.content.length}/{MAX_LENGTH}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={compose.cancel}
                      className="text-[0.6rem] text-white/30 hover:text-white/60 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={compose.seal}
                      disabled={!compose.content.trim()}
                      className="text-[0.6rem] px-2.5 py-1 rounded-lg bg-white/20 text-white/80 hover:bg-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      봉인하기 ✉
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── 드래그 오버레이 ── */}
      {isDragging && dragPos && (
        <div
          className="fixed inset-0 z-[80]"
          style={{ touchAction: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{ height: shoreY }}
            animate={{ backgroundColor: dragPos.y < shoreY ? "rgba(70,150,255,0.07)" : "transparent" }}
            transition={{ duration: 0.2 }}
          />

          <AnimatePresence>
            {dragPos.y < shoreY + 60 && dragPos.y > shoreY - 120 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 text-white/50 pointer-events-none"
                style={{ top: shoreY - 28, fontSize: "0.6rem", letterSpacing: "0.1em" }}
              >
                여기서 놓으면 바다로 던져집니다
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className="absolute pointer-events-none"
            style={{ left: dragPos.x, top: dragPos.y, transform: "translate(-50%, -50%)" }}
          >
            <div
              style={{
                transform: `rotate(${rotation + 15}deg) scale(${dragPos.y < shoreY ? 1.12 : 1})`,
                transition: "transform 0.15s ease",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              }}
            >
              <GlassBottle size={2.8} hasNote bottleColor={compose.options.bottleColor} paperStyle={compose.options.paperStyle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
