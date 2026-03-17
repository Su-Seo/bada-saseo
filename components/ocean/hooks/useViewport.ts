"use client";

import { useEffect, useState } from "react";
import { HORIZON_PCT, SHORE_PCT } from "../constants";

export function useViewport() {
  const [viewH, setViewH] = useState(800);

  useEffect(() => {
    const update = () => setViewH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const horizonY = viewH * HORIZON_PCT;
  const shoreY = viewH * SHORE_PCT;

  return { viewH, horizonY, shoreY };
}
