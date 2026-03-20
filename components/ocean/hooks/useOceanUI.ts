"use client";

import { useCallback, useState } from "react";
import type { BagType } from "../BottleBag";

export function useOceanUI() {
  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [todayBagOpen, setTodayBagOpen] = useState<BagType | null>(null);

  const openThrow = useCallback(() => setThrowOpen(true), []);
  const closeThrow = useCallback(() => setThrowOpen(false), []);
  const openPick = useCallback((id: string) => setPickMessageId(id), []);
  const closePick = useCallback(() => setPickMessageId(null), []);
  const openStats = useCallback(() => setStatsOpen(true), []);
  const closeStats = useCallback(() => setStatsOpen(false), []);
  const openTodayBag = useCallback((type: BagType) => setTodayBagOpen(type), []);
  const closeTodayBag = useCallback(() => setTodayBagOpen(null), []);

  return {
    throwOpen, openThrow, closeThrow,
    pickMessageId, openPick, closePick,
    statsOpen, openStats, closeStats,
    todayBagOpen, openTodayBag, closeTodayBag,
  };
}
