"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_LENGTH } from "@/lib/constants";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";
import { postMessage } from "@/lib/api";
import GlassBottle from "./GlassBottle";
import BottleCustomizer from "./BottleCustomizer";

interface Props {
  id: string;
  x: number;
  y: number;
  rotation: number;
  shoreY: number;
  horizonY: number;
  /** 던지기 완료 후 병 제거를 부모에 알림 (내용/옵션은 여기서 직접 처리) */
  onThrow: (id: string) => void;
  onRemove: (id: string) => void;
}

type State = "empty" | "writing" | "filled" | "throwing";

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
  const [state, setState] = useState<State>("empty");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [throwData, setThrowData] = useState<{ x: number; y: number } | null>(null);
  const bottleRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (state === "empty") setState("writing");
  };

  const handleSeal = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_LENGTH) {
      setError(`${MAX_LENGTH}자 이하로 작성해주세요.`);
      return;
    }
    setError("");
    setState("filled");
  };

  const handleCancel = () => {
    setContent("");
    setError("");
    setOptions(DEFAULT_COMPOSE_OPTIONS);
    setState("empty");
  };

  // ── 드래그 ──
  const handlePointerDown = (e: React.PointerEvent) => {
    if (state !== "filled") return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (e.clientY < shoreY) {
      setThrowData({ x: e.clientX, y: e.clientY });
      setState("throwing");
      postMessage(content, options).catch(() => {});
      onThrow(id);
    } else {
      setDragPos(null);
    }
  };

  // ── 던지기 애니메이션 ──
  if (state === "throwing" && throwData) {
    return (
      <motion.div
        className="fixed z-[85] pointer-events-none"
        style={{ left: throwData.x, top: throwData.y, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        animate={{ scale: 0.1, opacity: 0, y: horizonY - throwData.y, rotate: 60 }}
        transition={{ duration: 1.4, ease: [0.15, 0.75, 0.35, 1] }}
        onAnimationComplete={() => onRemove(id)}
      >
        <GlassBottle size={2.8} hasNote bottleColor={options.bottleColor} paperStyle={options.paperStyle} />
      </motion.div>
    );
  }

  return (
    <>
      {/* ── 해변 병 ── */}
      {!isDragging && (
        <motion.div
          ref={bottleRef}
          className="absolute"
          style={{ left: `${x}%`, bottom: `${y}%`, zIndex: 32 }}
          initial={{ opacity: 0, scale: 0, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }}
        >
          <div
            onClick={state === "empty" ? handleClick : undefined}
            onPointerDown={state === "filled" ? handlePointerDown : undefined}
            className="relative"
            style={{ touchAction: "none", cursor: state === "filled" ? "grab" : "pointer" }}
          >
            <span
              className={state === "filled" ? "beach-bottle-filled" : "beach-bottle-empty"}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <GlassBottle
                size={2.2}
                hasNote={state === "filled"}
                bottleColor={state === "filled" ? options.bottleColor : undefined}
                paperStyle={state === "filled" ? options.paperStyle : undefined}
              />
            </span>
          </div>

          <AnimatePresence>
            {state === "filled" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/50 pointer-events-none"
                style={{ fontSize: "0.42rem", letterSpacing: "0.06em" }}
              >
                끌어서 바다로 ↑
              </motion.p>
            )}
          </AnimatePresence>

          {/* ── 인라인 글쓰기 카드 ── */}
          <AnimatePresence>
            {state === "writing" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.92 }}
                className="absolute bottom-full mb-3 bg-black/55 backdrop-blur-xl border border-white/20 rounded-2xl p-3 text-white"
                style={{
                  zIndex: 38,
                  width: "15rem",
                  left: "50%",
                  transform: `translateX(${x < 22 ? "-15%" : x > 78 ? "-85%" : "-50%"})`,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <BottleCustomizer
                  value={options}
                  onChange={(updates) => setOptions((prev) => ({ ...prev, ...updates }))}
                  size="sm"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={MAX_LENGTH}
                  placeholder="마음을 적어보세요..."
                  className="w-full h-20 resize-none rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 p-2 text-xs leading-relaxed focus:outline-none focus:border-white/40 transition-colors mt-2"
                  autoFocus
                />

                {error && <p className="text-[0.6rem] text-red-400 mt-1">{error}</p>}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.55rem] text-white/25">{content.length}/{MAX_LENGTH}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="text-[0.6rem] text-white/30 hover:text-white/60 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSeal}
                      disabled={!content.trim()}
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
              <GlassBottle size={2.8} hasNote bottleColor={options.bottleColor} paperStyle={options.paperStyle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
