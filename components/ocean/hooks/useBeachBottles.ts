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
    x: rand(22, 92),
    y: rand(3, 19),
    rotation: rand(-35, 12),
  };
}

export function useBeachBottles() {
  const [beachBottles, setBeachBottles] = useState<BeachBottleItem[]>([]);

  // 클라이언트에서만 생성 → hydration mismatch 방지 (Math.random은 서버/클라이언트 값이 다름)
  useEffect(() => {
    const initial = Array.from({ length: 3 }, () => createBeachBottle());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBeachBottles(initial);

    const timer = setInterval(() => {
      setBeachBottles((prev) => {
        if (prev.length >= MAX_BEACH_BOTTLES) return prev;
        return [...prev, createBeachBottle()];
      });
    }, BEACH_SPAWN_MS);

    return () => clearInterval(timer);
  }, []);

  const handleBeachRemove = useCallback((bottleId: string) => {
    setBeachBottles((prev) => prev.filter((b) => b.id !== bottleId));
  }, []);

  return { beachBottles, handleBeachRemove };
}
