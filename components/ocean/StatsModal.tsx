"use client";

import { motion } from "framer-motion";
import TagChart from "@/components/stats/TagChart";
import WordCloud from "@/components/stats/WordCloud";
import { useStats } from "./hooks/useStats";

interface Props {
  onClose: () => void;
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
  const { data, loading } = useStats(true);

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

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto px-6 pb-6 space-y-5">
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard
                  label="전체 편지"
                  value={data.stats.totalCount.toLocaleString()}
                  sub="현재 바다 위"
                />
                <StatCard
                  label="오늘 편지"
                  value={data.stats.todayCount.toLocaleString()}
                  sub="오늘 띄워진 병"
                />
                <StatCard
                  label="총 하트"
                  value={data.stats.totalHearts.toLocaleString()}
                  sub="받은 공감"
                />
                <StatCard
                  label="평균 하트"
                  value={data.stats.avgHeart.toFixed(1)}
                  sub="편지당 평균"
                />
              </div>

              {/* 태그별 분포 */}
              <div className="rounded-2xl bg-white/6 border border-white/10 p-5">
                <h3 className="text-white/55 text-xs font-medium mb-4 tracking-wide">
                  태그별 편지 분포
                </h3>
                <TagChart stats={data.tagStats} />
              </div>

              {/* 단어 클라우드 */}
              {data.wordFrequency.length > 0 && (
                <div className="rounded-2xl bg-white/6 border border-white/10 p-5">
                  <h3 className="text-white/55 text-xs font-medium mb-1 tracking-wide">
                    자주 쓰인 단어
                  </h3>
                  <p className="text-white/25 text-[10px] mb-4">
                    최근 편지 500건 기준 · 크기가 클수록 자주 등장해요
                  </p>
                  <WordCloud words={data.wordFrequency} />
                </div>
              )}
            </>
          )}

          {!loading && !data && (
            <p className="text-white/40 text-sm text-center py-12">
              통계를 불러오지 못했어요.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
