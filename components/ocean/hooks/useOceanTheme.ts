"use client";

import { useEffect, useState } from "react";
import {
  OceanTheme,
  DARK_THEME,
  LIGHT_THEME,
  getThemeForHour,
  buildGradient,
  getWaveColors,
} from "@/lib/oceanTheme";
import { HORIZON_PCT, SHORE_PCT, BEACH_PCT } from "../constants";

export const THEME_MODE = {
  DARK: "dark",
  LIGHT: "light",
  AUTO: "auto",
} as const;

export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

function getCurrentHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function getTheme(mode: ThemeMode, hour: number): OceanTheme {
  switch (mode) {
    case THEME_MODE.DARK:
      return DARK_THEME;
    case THEME_MODE.LIGHT:
      return LIGHT_THEME;
    case THEME_MODE.AUTO:
      return getThemeForHour(hour);
  }
}

// 태양 위치 계산 (일출 5:30 ~ 일몰 19:30 호 운동)
export function getSunPosition(
  mode: ThemeMode,
  hour: number
): { x: number; y: number } | null {
  if (mode === THEME_MODE.DARK) return null;
  const h = mode === THEME_MODE.LIGHT ? 12 : hour;
  const rise = 5.5;
  const set = 19.5;
  if (h < rise || h > set) return null;
  const progress = (h - rise) / (set - rise);
  const x = 8 + progress * 84;
  const horizonY = HORIZON_PCT * 100 - 1;
  const peakY = 6;
  const sinVal = Math.sin(progress * Math.PI);
  const y = horizonY - sinVal * (horizonY - peakY);
  return { x, y };
}

export function useOceanTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(THEME_MODE.DARK);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    setCurrentHour(getCurrentHour());
  }, []);

  useEffect(() => {
    if (themeMode !== THEME_MODE.AUTO) return;
    setCurrentHour(getCurrentHour());
    const timer = setInterval(() => setCurrentHour(getCurrentHour()), 60_000);
    return () => clearInterval(timer);
  }, [themeMode]);

  const theme = getTheme(themeMode, currentHour);
  const gradient = buildGradient(theme, HORIZON_PCT, SHORE_PCT, BEACH_PCT);
  const waveColors = getWaveColors(theme);
  const sunPos = theme.sunOpacity > 0.01 ? getSunPosition(themeMode, currentHour) : null;

  return { themeMode, setThemeMode, currentHour, theme, gradient, waveColors, sunPos };
}
