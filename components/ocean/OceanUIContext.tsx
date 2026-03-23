"use client";

import { createContext, useContext } from "react";
import type { BagType } from "./BottleBag";

export interface OceanUIContextValue {
  // 모달 상태
  throwOpen: boolean;
  openThrow: () => void;
  closeThrow: () => void;
  pickMessageId: string | null;
  openPick: (id: string) => void;
  closePick: () => void;
  statsOpen: boolean;
  openStats: () => void;
  closeStats: () => void;
  todayBagOpen: BagType | null;
  openTodayBag: (type: BagType) => void;
  closeTodayBag: () => void;
  // 바다 상태
  floatingMessageIds: Set<string>;
  pendingCount: number;
  refreshBagCounts: (pendingAdjustment?: number) => void;
  // 바구니 카운트
  unhearted: number;
  hearted: number;
}

export const OceanUIContext = createContext<OceanUIContextValue | null>(null);

export function useOceanUIContext(): OceanUIContextValue {
  const ctx = useContext(OceanUIContext);
  if (!ctx) throw new Error("useOceanUIContext must be used within OceanUIContext.Provider");
  return ctx;
}
