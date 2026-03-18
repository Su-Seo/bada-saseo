"use client";

interface TagStat {
  name: string;
  count: number;
}

interface Props {
  stats: TagStat[];
}

const TAG_COLORS = [
  "from-sky-400 to-cyan-400",
  "from-violet-400 to-purple-400",
  "from-rose-400 to-pink-400",
  "from-amber-400 to-yellow-400",
  "from-emerald-400 to-teal-400",
  "from-blue-400 to-indigo-400",
  "from-orange-400 to-red-400",
];

export default function TagChart({ stats }: Props) {
  const sorted = [...stats].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count ?? 1;
  const total = sorted.reduce((s, t) => s + t.count, 0);

  if (total === 0) {
    return (
      <p className="text-white/40 text-sm text-center py-8">아직 편지가 없어요.</p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((tag, i) => {
        const pct = total > 0 ? Math.round((tag.count / total) * 100) : 0;
        const barWidth = max > 0 ? (tag.count / max) * 100 : 0;
        const color = TAG_COLORS[i % TAG_COLORS.length];

        return (
          <div key={tag.name} className="flex items-center gap-3">
            <span className="w-10 text-right text-white/60 text-sm shrink-0">
              {tag.name}
            </span>
            <div className="flex-1 relative h-6 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} opacity-80 transition-all duration-700`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="w-16 text-white/50 text-xs shrink-0">
              {tag.count}건 <span className="text-white/30">({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
