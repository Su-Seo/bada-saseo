import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api";
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

export interface StatsData {
  stats: Stats;
  tagStats: TagStat[];
  wordFrequency: WordEntry[];
}

export function useStats(enabled: boolean) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);

    Promise.all([
      fetchJSON<Stats>("/api/stats"),
      fetchJSON<{ stats: TagStat[] }>("/api/tags/stats"),
      fetchJSON<{ words: WordEntry[] }>("/api/stats/words"),
    ]).then(([stats, tagData, wordData]) => {
      if (stats && tagData && wordData) {
        setData({ stats, tagStats: tagData.stats, wordFrequency: wordData.words });
      }
      setLoading(false);
    });
  }, [enabled]);

  return { data, loading };
}
