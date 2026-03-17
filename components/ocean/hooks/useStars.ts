"use client";

import { useEffect, useState } from "react";
import { HORIZON_PCT } from "../constants";

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function useStars() {
  const [stars, setStars] = useState<Star[]>([]);

  // 클라이언트에서만 생성 → hydration mismatch 방지
  useEffect(() => {
    setStars(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * (HORIZON_PCT * 100 - 2),
        size: 0.5 + Math.random() * 2.2,
        duration: 2 + Math.random() * 5,
        delay: Math.random() * 6,
      }))
    );
  }, []);

  return stars;
}
