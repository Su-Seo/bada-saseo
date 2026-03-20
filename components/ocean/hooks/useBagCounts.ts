"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTodayBagCounts } from "@/lib/api";

interface BagCounts {
  unhearted: number;
  hearted: number;
}

export function useBagCounts() {
  const [counts, setCounts] = useState<BagCounts>({ unhearted: 0, hearted: 0 });

  const refresh = useCallback((pendingAdjustment = 0) => {
    fetchTodayBagCounts().then((data) => {
      if (data) setCounts({
        unhearted: Math.max(0, data.unhearted - pendingAdjustment),
        hearted: data.hearted,
      });
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...counts, refresh };
}
