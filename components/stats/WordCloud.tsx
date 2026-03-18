"use client";

import type { WordEntry } from "@/lib/wordFrequency";

interface Props {
  words: WordEntry[];
}

const WORD_COLORS = [
  "text-sky-300",
  "text-cyan-300",
  "text-teal-300",
  "text-violet-300",
  "text-purple-300",
  "text-rose-300",
  "text-pink-300",
  "text-amber-300",
  "text-emerald-300",
  "text-blue-300",
];

export default function WordCloud({ words }: Props) {
  if (words.length === 0) {
    return (
      <p className="text-white/40 text-sm text-center py-8">아직 편지가 없어요.</p>
    );
  }

  const max = words[0].count;
  const min = words[words.length - 1].count;
  const range = Math.max(max - min, 1);

  // 빈도에 따라 폰트 크기 계산 (0.75rem ~ 2.25rem)
  function fontSize(count: number): string {
    const t = (count - min) / range;
    const size = 0.75 + t * 1.5;
    return `${size.toFixed(2)}rem`;
  }

  // 빈도에 따라 불투명도 계산
  function opacity(count: number): number {
    const t = (count - min) / range;
    return 0.45 + t * 0.55;
  }

  // 단어마다 고정 색상 (인덱스 기반)
  function color(i: number): string {
    return WORD_COLORS[i % WORD_COLORS.length];
  }

  // 가독성을 위해 빈도 순 대신 셔플해서 표시
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center leading-none">
      {shuffled.map((entry, i) => (
        <span
          key={entry.word}
          className={`${color(i)} font-medium transition-opacity`}
          style={{ fontSize: fontSize(entry.count), opacity: opacity(entry.count) }}
          title={`${entry.count}회`}
        >
          {entry.word}
        </span>
      ))}
    </div>
  );
}
