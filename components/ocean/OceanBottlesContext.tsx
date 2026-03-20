"use client";

import { createContext, useCallback, useContext } from "react";
import { postMessage } from "@/lib/api";
import type { ComposeOptions } from "@/lib/types";

interface OceanBottlesContextValue {
  addMyBottle: (messageId: string, bottleColor: string | null) => void;
}

const OceanBottlesContext = createContext<OceanBottlesContextValue | null>(null);

export const OceanBottlesProvider = OceanBottlesContext.Provider;

const NOOP = () => {};

function useAddMyBottle() {
  const ctx = useContext(OceanBottlesContext);
  // Provider 없는 환경(독립 페이지 등)에서는 no-op으로 fallback
  return ctx?.addMyBottle ?? NOOP;
}

/** 메시지 전송 + 낙관적 업데이트를 하나로 묶은 훅 */
export function useSubmitBottle() {
  const addMyBottle = useAddMyBottle();

  return useCallback(async (content: string, options: ComposeOptions): Promise<{ ok: boolean; error?: string }> => {
    const result = await postMessage(content, options);
    if (result.ok && result.messageId) {
      addMyBottle(result.messageId, result.bottleColor ?? null);
    }
    return result;
  }, [addMyBottle]);
}
