"use client";

import Link from "next/link";
import TagChart from "./TagChart";
import WordCloud from "./WordCloud";
import type { WordEntry } from "@/lib/wordFrequency";

interface Stats {
  todayCount: number;
  totalCount: number;
  totalHearts: number;
  avgHeart: number;
}

interface TagStat {
  name: string;
  count: number;
}

interface Props {
  stats: Stats;
  tagStats: TagStat[];
  wordFrequency: WordEntry[];
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 backdrop-blur-sm px-6 py-5 flex flex-col gap-1">
      <span className="text-white/45 text-xs tracking-wide">{label}</span>
      <span className="text-white text-3xl font-semibold tabular-nums">{value}</span>
      {sub && <span className="text-white/35 text-xs">{sub}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-sm p-6">
      <h2 className="text-white/70 text-sm font-medium mb-5 tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

export default function StatsPage({ stats, tagStats, wordFrequency }: Props) {
  const topTag = [...tagStats].sort((a, b) => b.count - a.count)[0];

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(160deg, rgb(4,8,20) 0%, rgb(10,24,52) 35%, rgb(7,32,60) 65%, rgb(4,16,36) 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto px-5 py-12 space-y-8">
        {/* 헤더 */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">바다사서 통계</h1>
            <p className="text-white/40 text-sm mt-1">바다를 떠다니는 편지들의 이야기</p>
          </div>
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            ← 돌아가기
          </Link>
        </header>

        {/* 총계 카드 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="전체 편지"
            value={stats.totalCount.toLocaleString()}
            sub="현재 바다 위"
          />
          <StatCard
            label="오늘 편지"
            value={stats.todayCount.toLocaleString()}
            sub="오늘 띄워진 병"
          />
          <StatCard
            label="총 하트"
            value={stats.totalHearts.toLocaleString()}
            sub="받은 공감"
          />
          <StatCard
            label="평균 하트"
            value={stats.avgHeart.toFixed(1)}
            sub="편지당 평균"
          />
        </div>

        {/* 인기 태그 하이라이트 */}
        {topTag && topTag.count > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-sky-900/40 to-cyan-900/30 border border-sky-500/20 px-6 py-4 flex items-center gap-4">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-white/50 text-xs">가장 많은 편지 태그</p>
              <p className="text-white font-semibold text-lg">
                #{topTag.name}
                <span className="text-white/40 text-sm font-normal ml-2">
                  {topTag.count}건
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 태그별 분포 */}
        <Section title="태그별 편지 분포">
          <TagChart stats={tagStats} />
        </Section>

        {/* 단어 클라우드 */}
        <Section title="자주 쓰인 단어">
          <p className="text-white/30 text-xs mb-5">
            최근 편지 500건 기준 · 단어 크기가 클수록 자주 등장해요
          </p>
          <WordCloud words={wordFrequency} />
        </Section>

        <footer className="text-center text-white/20 text-xs pb-4">
          5분마다 갱신됩니다
        </footer>
      </div>
    </div>
  );
}
