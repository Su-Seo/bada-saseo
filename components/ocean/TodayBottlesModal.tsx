"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import GlassBottle from "./GlassBottle";
import { useTodayBottles, type TodayBottleItem } from "./hooks/useTodayBottles";
import type { BagType } from "./BottleBag";

interface Props {
  type: BagType;
  onClose: () => void;
  onPickMessage: (id: string) => void;
  floatingMessageIds: Set<string>;
}

function formatTime(createdAt: string): string {
  const diffMins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
}

function BottleListItem({ msg, onPick }: { msg: TodayBottleItem; onPick: () => void }) {
  return (
    <li>
      <button
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 active:bg-white/10 transition-colors"
        onClick={onPick}
      >
        <div className="shrink-0 flex items-center justify-center" style={{ width: 22 }}>
          <GlassBottle size={1.1} bottleColor={msg.bottleColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{msg.content}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {msg.tag && (
              <span className="text-white/40 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">
                {msg.tag}
              </span>
            )}
            {msg.heartCount > 0 && (
              <span className="text-pink-400/70 text-[9px]">♥ {msg.heartCount}</span>
            )}
            <span className="text-white/30 text-[9px] ml-auto">{formatTime(msg.createdAt)}</span>
          </div>
        </div>
      </button>
    </li>
  );
}

export default function TodayBottlesModal({ type, onClose, onPickMessage, floatingMessageIds }: Props) {
  const { messages, loading, error, fetchMessages, reset } = useTodayBottles();

  useEffect(() => {
    fetchMessages(type === "hearted");
    return () => reset();
  }, [type, fetchMessages, reset]);

  const title = type === "hearted" ? "💗 공감받은 유리병" : "🫙 외로운 유리병";
  const emptyMsg =
    type === "hearted"
      ? "아직 공감받은 유리병이 없어요"
      : "오늘 던져진 유리병이 없어요";

  const visibleMessages = messages?.filter((msg) => !floatingMessageIds.has(msg.id)) ?? null;

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-start px-4 pb-20 sm:pb-0 sm:pl-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-white/90 text-sm font-medium tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors text-xs"
          >
            닫기
          </button>
        </div>

        {/* 내용 */}
        <div className="max-h-64 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, -12, 12, -12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🍾
              </motion.span>
            </div>
          )}

          {error && (
            <p className="text-white/50 text-xs text-center py-8 px-4">{error}</p>
          )}

          {!loading && !error && visibleMessages?.length === 0 && (
            <p className="text-white/40 text-xs text-center py-8 tracking-wider px-4">
              {emptyMsg}
            </p>
          )}

          {visibleMessages && visibleMessages.length > 0 && (
            <ul className="divide-y divide-white/5">
              {visibleMessages.map((msg) => (
                <BottleListItem
                  key={msg.id}
                  msg={msg}
                  onPick={() => onPickMessage(msg.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
