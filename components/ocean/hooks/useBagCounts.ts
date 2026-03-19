"use client";

import { useEffect, useState } from "react";
import { fetchTodayBagCounts } from "@/lib/api";

interface BagCounts {
  unhearded: number;
  hearted: number;
}

export function useBagCounts() {
  const [counts, setCounts] = useState<BagCounts>({ unhearded: 0, hearted: 0 });

  useEffect(() => {
    fetchTodayBagCounts().then((data) => {
      if (data) setCounts(data);
    });
  }, []);

  return counts;
}
