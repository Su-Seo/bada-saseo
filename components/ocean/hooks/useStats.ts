import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api";
import type { WordEntry } from "@/lib/wordFrequency";

interface Stats {
  todayCount: number;
  totalCount: number;
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

export function useStats(enabled: boolean, from: string, to: string) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const q = from && to ? `?from=${from}&to=${to}` : "";
    Promise.resolve()
      .then(() => {
        setLoading(true);
        return Promise.all([
          fetchJSON<Stats>(`/api/stats${q}`),
          fetchJSON<{ stats: TagStat[] }>(`/api/tags/stats${q}`),
          fetchJSON<{ words: WordEntry[] }>(`/api/stats/words${q}`),
        ]);
      })
      .then(([stats, tagData, wordData]) => {
        if (stats && tagData && wordData) {
          setData({ stats, tagStats: tagData.stats, wordFrequency: wordData.words });
        }
        setLoading(false);
      });
  }, [enabled, from, to]);

  return { data, loading };
}
