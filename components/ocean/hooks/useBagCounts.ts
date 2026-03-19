"use client";

import { useEffect, useState } from "react";
import { fetchTodayBagCounts } from "@/lib/api";

interface BagCounts {
  unhearted: number;
  hearted: number;
}

export function useBagCounts() {
  const [counts, setCounts] = useState<BagCounts>({ unhearted: 0, hearted: 0 });

  useEffect(() => {
    fetchTodayBagCounts().then((data) => {
      if (data) setCounts(data);
    });
  }, []);

  return counts;
}
