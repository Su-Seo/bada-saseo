"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAX_LENGTH, TAGS, Tag, BOTTLE_COLORS, BottleColor, PAPER_STYLES, PaperStyle, BOTTLE_COLOR_MAP, PAPER_STYLE_MAP } from "@/lib/constants";
import GlassBottle from "./GlassBottle";

interface Props {
  id: string;
  x: number;
  y: number;
  rotation: number;
  shoreY: number;
  horizonY: number;
  onThrow: (id: string, content: string, bottleColor: BottleColor, paperStyle: PaperStyle, tag: Tag | null) => void;
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
  const [tag, setTag] = useState<Tag | null>(null);
  const [bottleColor, setBottleColor] = useState<BottleColor>("초록");
  const [paperStyle, setPaperStyle] = useState<PaperStyle>("기본");
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
    setTag(null);
    setBottleColor("초록");
    setPaperStyle("기본");
    setState("empty");
  };

  // ── 드래그 핸들러 ──
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
      onThrow(id, content, bottleColor, paperStyle, tag);
    } else {
      setDragPos(null);
    }
  };

  // ── 던지기 애니메이션 ──
  if (state === "throwing" && throwData) {
    return (
      <motion.div
        className="fixed z-[85] pointer-events-none"
        style={{
          left: throwData.x,
          top: throwData.y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        animate={{
          scale: 0.1,
          opacity: 0,
          y: horizonY - throwData.y,
          rotate: 60,
        }}
        transition={{ duration: 1.4, ease: [0.15, 0.75, 0.35, 1] }}
        onAnimationComplete={() => onRemove(id)}
      >
        <GlassBottle size={2.8} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
      </motion.div>
    );
  }

  return (
    <>
      {/* ── 해변 위의 병 ── */}
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
          {/* 병 본체 */}
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
                bottleColor={state === "filled" ? bottleColor : undefined}
                paperStyle={state === "filled" ? paperStyle : undefined}
              />
            </span>
          </div>

          {/* 드래그 힌트 */}
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
                  transform: `translateX(${
                    x < 22 ? "-15%" : x > 78 ? "-85%" : "-50%"
                  })`,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* 미리보기 + 입력 헤더 */}
                <div className="flex items-center gap-2 mb-2">
                  <GlassBottle size={2.0} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.58rem] text-white/40 tracking-widest mb-1">마음 담기</p>
                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1">
                      {TAGS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(tag === t ? null : t)}
                          className={`px-1.5 py-0.5 rounded-full text-[0.5rem] transition-all border ${
                            tag === t
                              ? "bg-white/25 border-white/50 text-white"
                              : "bg-white/5 border-white/15 text-white/35 hover:bg-white/15"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 병 색상 */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[0.5rem] text-white/30 w-8 shrink-0">색상</span>
                  <div className="flex flex-wrap gap-1">
                    {BOTTLE_COLORS.map((c) => {
                      const { r, g, b } = BOTTLE_COLOR_MAP[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBottleColor(c)}
                          title={c}
                          className={`w-3.5 h-3.5 rounded-full transition-all border ${
                            bottleColor === c ? "border-white/80 scale-125" : "border-white/20"
                          }`}
                          style={{ background: `rgba(${r},${g},${b},0.85)` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 편지지 */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[0.5rem] text-white/30 w-8 shrink-0">편지지</span>
                  <div className="flex gap-1">
                    {PAPER_STYLES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPaperStyle(p)}
                        title={PAPER_STYLE_MAP[p].label}
                        className={`w-3.5 h-3.5 rounded transition-all border ${
                          paperStyle === p ? "border-white/80 scale-125" : "border-white/20"
                        }`}
                        style={{ background: PAPER_STYLE_MAP[p].note }}
                      />
                    ))}
                  </div>
                </div>

                {/* 텍스트 입력 */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={MAX_LENGTH}
                  placeholder="마음을 적어보세요..."
                  className="w-full h-20 resize-none rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 p-2 text-xs leading-relaxed focus:outline-none focus:border-white/40 transition-colors"
                  autoFocus
                />

                {error && (
                  <p className="text-[0.6rem] text-red-400 mt-1">{error}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.55rem] text-white/25">
                    {content.length}/{MAX_LENGTH}
                  </span>
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
            animate={{
              backgroundColor:
                dragPos.y < shoreY ? "rgba(70,150,255,0.07)" : "transparent",
            }}
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

          {/* 드래그 중인 병 */}
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
              <GlassBottle size={2.8} hasNote bottleColor={bottleColor} paperStyle={paperStyle} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
