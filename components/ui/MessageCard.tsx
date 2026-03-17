"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { PaperStyle, PAPER_STYLE_MAP } from "@/lib/constants";

interface Props {
  id: string;
  content: string;
  tag?: string | null;
  bottleColor?: string | null;
  paperStyle?: string | null;
  heartCount: number;
  onClose: () => void;
}

export default function MessageCard({ id, content, tag, paperStyle, heartCount, onClose }: Props) {
  const paperBg = PAPER_STYLE_MAP[(paperStyle as PaperStyle) ?? "기본"]?.note ?? PAPER_STYLE_MAP["기본"].note;
  const [hearted, setHearted] = useState(false);
  const [reported, setReported] = useState(false);
  const [currentHearts, setCurrentHearts] = useState(heartCount);

  const handleHeart = async () => {
    if (hearted) return;
    await fetch(`/api/messages/${id}/heart`, { method: "POST" });
    setHearted(true);
    setCurrentHearts((n) => n + 1);
  };

  const handleReport = async () => {
    if (reported) return;
    await fetch(`/api/messages/${id}/report`, { method: "POST" });
    setReported(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl"
      style={{ background: `color-mix(in srgb, ${paperBg} 18%, rgba(255,255,255,0.06))` }}
    >
      {/* 편지지 느낌 헤더 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-xs text-white/40 tracking-widest uppercase">
          바다에서 건져낸 편지
        </p>
        {tag && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/15 border border-white/20 text-white/60">
            {tag}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
        {content}
      </p>

      <div className="mt-6 flex items-center justify-between">
        {/* 하트 버튼 */}
        <button
          onClick={handleHeart}
          disabled={hearted}
          className={`flex items-center gap-2 text-sm transition-all ${
            hearted ? "text-pink-400 scale-110" : "text-white/50 hover:text-pink-400"
          }`}
          aria-label="공감"
        >
          <span className="text-xl">{hearted ? "❤️" : "🤍"}</span>
          <span>{currentHearts}</span>
        </button>

        <div className="flex gap-3">
          {/* 신고 버튼 */}
          {!reported ? (
            <button
              onClick={handleReport}
              className="text-xs text-white/30 hover:text-red-400 transition-colors"
              aria-label="신고"
            >
              신고
            </button>
          ) : (
            <span className="text-xs text-white/30">신고 완료</span>
          )}

        </div>
      </div>
    </motion.div>
  );
}
