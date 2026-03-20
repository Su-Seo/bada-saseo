"use client";

import { useState } from "react";
import type { BagType } from "../BottleBag";

export function useOceanUI() {
  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [todayBagOpen, setTodayBagOpen] = useState<BagType | null>(null);

  return {
    throwOpen, setThrowOpen,
    pickMessageId, setPickMessageId,
    statsOpen, setStatsOpen,
    todayBagOpen, setTodayBagOpen,
  };
}
