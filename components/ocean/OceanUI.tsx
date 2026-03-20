"use client";

import { type ComponentProps } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThrowModal from "./ThrowModal";
import PickModal from "./PickModal";
import GlassBottle from "./GlassBottle";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "./ThemeToggle";
import StatsModal from "./StatsModal";
import { type BagType } from "./BottleBag";
import TodayBottlesModal from "./TodayBottlesModal";
import { getTextClasses } from "@/lib/oceanTheme";

interface OceanUIProps {
  isDaytime: boolean;
  bottlesEmpty: boolean;
  todayCount: number | null;
  pendingCount: number;
  refreshBagCounts: (count: number) => void;
  themeToggleProps: ComponentProps<typeof ThemeToggle>;
  // 모달 상태
  throwOpen: boolean;
  onThrowOpen: () => void;
  onThrowClose: () => void;
  pickMessageId: string | null;
  onPickClose: () => void;
  onPickMessage: (id: string) => void;
  statsOpen: boolean;
  onStatsOpen: () => void;
  onStatsClose: () => void;
  todayBagOpen: BagType | null;
  onTodayBagClose: () => void;
}

export default function OceanUI({
  isDaytime,
  bottlesEmpty,
  todayCount,
  pendingCount,
  refreshBagCounts,
  themeToggleProps,
  throwOpen,
  onThrowOpen,
  onThrowClose,
  pickMessageId,
  onPickClose,
  onPickMessage,
  statsOpen,
  onStatsOpen,
  onStatsClose,
  todayBagOpen,
  onTodayBagClose,
}: OceanUIProps) {
  const txt = getTextClasses(isDaytime);

  return (
    <>
      {/* ── UI: 던지기 버튼 ── */}
      <button
        className={`fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-2xl backdrop-blur-sm border transition-all active:scale-95 ${
          isDaytime
            ? "bg-black/15 border-black/3 text-white/90 hover:bg-black/25"
            : "bg-white/8 border-white/15 text-white/60 hover:bg-white/15 hover:text-white/90"
        }`}
        onClick={onThrowOpen}
        aria-label="고민 던지기"
        title="고민 던지기"
      >
        <GlassBottle size={1.4} />
        <span
          className={isDaytime ? "text-white/90 tracking-wider" : "text-white/50 tracking-wider"}
          style={{ fontSize: "0.55rem", writingMode: "vertical-rl" }}
        >
          던지기
        </span>
      </button>

      {/* ── UI: 타이틀 ── */}
      <div className="absolute top-5 left-5 z-40 pointer-events-none">
        <h1
          className={`font-light tracking-[0.45em] ${txt.dim}`}
          style={{ fontSize: "0.75rem" }}
        >
          바다사서
        </h1>
      </div>

      {/* ── UI: 우상단 설정 (소리 토글 | 테마 토글) ── */}
      <div className="fixed top-4 right-4 z-50 flex items-start gap-1">
        <SoundToggle isDaytime={isDaytime} />
        <ThemeToggle {...themeToggleProps} />
      </div>

      {/* ── UI: 오늘 통계 (클릭 → 통계 모달) ── */}
      {todayCount !== null && (
        <button
          className={`fixed bottom-5 right-5 z-40 text-right px-2.5 py-1.5 rounded-xl transition-all active:scale-95 ${
            isDaytime ? "bg-black/25 backdrop-blur-sm hover:bg-black/35" : "hover:bg-white/8"
          }`}
          onClick={onStatsOpen}
          aria-label="통계 보기"
        >
          <p className={`${txt.faint} tracking-wider`} style={{ fontSize: "0.65rem" }}>
            오늘 바다에 던져진 마음
          </p>
          <p
            className={`${txt.mid} font-light tabular-nums`}
            style={{ fontSize: "1.1rem", lineHeight: 1.2 }}
          >
            {todayCount.toLocaleString()}개
          </p>
        </button>
      )}

      {/* ── UI: 빈 바다 안내 ── */}
      <AnimatePresence>
        {bottlesEmpty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 4, duration: 2 }}
            className="absolute z-20 text-center pointer-events-none px-3 py-1.5 rounded-xl transition-colors"
            style={{ top: "52%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <p className={`${txt.faint} tracking-widest`} style={{ fontSize: "0.7rem" }}>
              아직 바다가 고요해요...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 모달 ── */}
      <AnimatePresence>
        {throwOpen && <ThrowModal key="throw" onClose={onThrowClose} />}
        {pickMessageId && (
          <PickModal
            key="pick"
            messageId={pickMessageId}
            onClose={() => { onPickClose(); refreshBagCounts(pendingCount); }}
          />
        )}
        {statsOpen && <StatsModal key="stats" onClose={onStatsClose} />}
        {todayBagOpen && (
          <TodayBottlesModal
            key={`bag-${todayBagOpen}`}
            type={todayBagOpen}
            onClose={onTodayBagClose}
            onPickMessage={onPickMessage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
