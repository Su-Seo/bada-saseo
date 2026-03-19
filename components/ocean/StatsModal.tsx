"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TagChart from "@/components/stats/TagChart";
import WordCloud from "@/components/stats/WordCloud";
import DailyChart from "@/components/stats/DailyChart";
import { useStats } from "./hooks/useStats";

interface Props {
  onClose: () => void;
}

const PRESETS = [
  { label: "오늘", days: 1 },
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/8 border border-white/10 px-4 py-3 flex flex-col gap-0.5">
      <span className="text-white/40 text-[10px] tracking-wide">{label}</span>
      <span className="text-white text-2xl font-semibold tabular-nums">{value}</span>
      {sub && <span className="text-white/30 text-[10px]">{sub}</span>}
    </div>
  );
}

export default function StatsModal({ onClose }: Props) {
  const today = toDateStr(new Date());
  const [preset, setPreset] = useState(7);
  const [isCustom, setIsCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fromDate = (() => {
    if (isCustom && customFrom) return customFrom;
    const d = new Date();
    d.setDate(d.getDate() - (preset - 1));
    return toDateStr(d);
  })();
  const toDate = isCustom && customTo ? customTo : today;

  const { data, loading } = useStats(true, fromDate, toDate);

  const handlePreset = (days: number) => {
    setPreset(days);
    setIsCustom(false);
  };

  const handleApply = () => {
    if (customFrom && customTo && customFrom <= customTo) setIsCustom(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 w-full sm:max-w-lg mx-4 mb-4 sm:mb-0 max-h-[85vh] flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
        initial={{ y: 60, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-white font-semibold tracking-wide">바다사서 통계</h2>
            <p className="text-white/35 text-xs mt-0.5">바다를 떠다니는 편지들의 이야기</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none pb-0.5"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 날짜 범위 선택 */}
        <div className="px-6 pb-4 shrink-0 flex flex-wrap items-center gap-2 border-b border-white/10">
          {PRESETS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => handlePreset(days)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !isCustom && preset === days
                  ? "bg-sky-500/40 text-sky-200 border border-sky-400/40"
                  : "bg-white/8 text-white/50 border border-white/10 hover:text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <input
              type="date"
              value={customFrom}
              max={today}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-white/8 border border-white/10 text-white/60 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-sky-400/40 w-28"
            />
            <span className="text-white/30 text-xs">~</span>
            <input
              type="date"
              value={customTo}
              max={today}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-white/8 border border-white/10 text-white/60 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-sky-400/40 w-28"
            />
            <button
              onClick={handleApply}
              disabled={!customFrom || !customTo || customFrom > customTo}
              className="px-2 py-1 rounded-full text-[10px] font-medium bg-white/8 text-white/50 border border-white/10 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              적용
            </button>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto px-6 pb-6 space-y-5 pt-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <motion.div
                className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {!loading && data && (
            <>
              {/* 총계 카드 */}
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="기간 편지" value={data.stats.totalCount.toLocaleString()} sub="선택 기간 합계" />
                <StatCard label="오늘 편지" value={data.stats.todayCount.toLocaleString()} sub="오늘 띄워진 병" />
              </div>

              {/* 일별 편지 추이 */}
              <div className="rounded-2xl bg-white/6 border border-white/10 p-5">
                <h3 className="text-white/55 text-xs font-medium mb-3 tracking-wide">일별 편지 추이</h3>
                <DailyChart from={fromDate} to={toDate} />
              </div>

              {/* 태그별 분포 */}
              <div className="rounded-2xl bg-white/6 border border-white/10 p-5">
                <h3 className="text-white/55 text-xs font-medium mb-4 tracking-wide">태그별 편지 분포</h3>
                <TagChart stats={data.tagStats} />
              </div>

              {/* 단어 클라우드 */}
              {data.wordFrequency.length > 0 && (
                <div className="rounded-2xl bg-white/6 border border-white/10 p-5">
                  <h3 className="text-white/55 text-xs font-medium mb-1 tracking-wide">자주 쓰인 단어</h3>
                  <p className="text-white/25 text-[10px] mb-4">
                    최근 편지 500건 기준 · 크기가 클수록 자주 등장해요
                  </p>
                  <WordCloud words={data.wordFrequency} />
                </div>
              )}
            </>
          )}

          {!loading && !data && (
            <p className="text-white/40 text-sm text-center py-12">통계를 불러오지 못했어요.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
