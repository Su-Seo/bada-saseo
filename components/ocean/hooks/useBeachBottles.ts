"use client";

import { useCallback, useEffect, useState } from "react";
import { MAX_BEACH_BOTTLES, BEACH_SPAWN_MS } from "../constants";
import { rand, uid } from "@/lib/utils";

export interface BeachBottleItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

function createBeachBottle(): BeachBottleItem {
  return {
    id: uid("bb"),
    x: rand(6, 86),
    y: rand(3, 19),
    rotation: rand(-35, 12),
  };
}

export function useBeachBottles() {
  const [beachBottles, setBeachBottles] = useState<BeachBottleItem[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 3 }, () => createBeachBottle());
    setBeachBottles(initial);

    const timer = setInterval(() => {
      setBeachBottles((prev) => {
        if (prev.length >= MAX_BEACH_BOTTLES) return prev;
        return [...prev, createBeachBottle()];
      });
    }, BEACH_SPAWN_MS);

    return () => clearInterval(timer);
  }, []);

  // BeachBottle이 직접 API 호출 — 여기선 제거만
  const handleBeachThrow = useCallback((_bottleId: string) => {}, []);

  const handleBeachRemove = useCallback((bottleId: string) => {
    setBeachBottles((prev) => prev.filter((b) => b.id !== bottleId));
  }, []);

  return { beachBottles, handleBeachThrow, handleBeachRemove };
}
