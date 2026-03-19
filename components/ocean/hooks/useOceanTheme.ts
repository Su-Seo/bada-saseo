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

const DEFAULT_THEME_MODE: ThemeMode = THEME_MODE.AUTO;

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
// buffer: 수평선 아래에서 완전히 가려진 상태로 출발/도착
export function getSunPosition(
  mode: ThemeMode,
  hour: number
): { x: number; y: number } | null {
  if (mode === THEME_MODE.DARK) return null;
  const h = mode === THEME_MODE.LIGHT ? 12 : hour;
  const rise = 5.5;
  const set = 19.5;
  const buffer = 0.75; // 45분 여유 — 이 시간 동안 수평선 아래에 위치
  const riseExt = rise - buffer;
  const setExt = set + buffer;
  if (h < riseExt || h > setExt) return null;
  const progress = (h - riseExt) / (setExt - riseExt);
  const x = 8 + progress * 84;
  const horizonY = HORIZON_PCT * 100 - 1;
  const peakY = 6;
  const yOffset = 4; // 경계에서 수평선 아래 4%에 위치 → 파도에 완전히 가려짐
  const sinVal = Math.sin(progress * Math.PI);
  const y = (horizonY + yOffset) - sinVal * (horizonY + yOffset - peakY);
  return { x, y };
}

// 달 위치 계산 (월출 19:30 ~ 월몰 다음날 5:30 호 운동)
export function getMoonPosition(
  mode: ThemeMode,
  hour: number
): { x: number; y: number } | null {
  if (mode === THEME_MODE.LIGHT) return null;
  // DARK 모드: 자정(0시) 고정 위치
  const h = mode === THEME_MODE.DARK ? 0 : hour;
  const rise = 19.5;
  const set = 29.5; // 다음날 5:30 = 24 + 5.5
  const buffer = 0.75;
  const riseExt = rise - buffer;
  const setExt = set + buffer;
  // 0~19.5 시간대를 24+ 범위로 변환
  const hn = h < rise ? h + 24 : h;
  if (hn < riseExt || hn > setExt) return null;
  const progress = (hn - riseExt) / (setExt - riseExt);
  const x = 8 + progress * 84;
  const horizonY = HORIZON_PCT * 100 - 1;
  const peakY = 6;
  const yOffset = 4;
  const sinVal = Math.sin(progress * Math.PI);
  const y = (horizonY + yOffset) - sinVal * (horizonY + yOffset - peakY);
  return { x, y };
}

export function useOceanTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  // 서버/클라이언트 시간 차이는 시(hour) 단위이므로 hydration mismatch 위험 없음
  const [currentHour, setCurrentHour] = useState(getCurrentHour);
  // null = 실시간 추적, number = 사용자가 조절한 시간
  const [adjustedHour, setAdjustedHour] = useState<number | null>(null);

  useEffect(() => {
    if (themeMode !== THEME_MODE.AUTO) return;
    const timer = setInterval(() => setCurrentHour(getCurrentHour()), 60_000);
    return () => clearInterval(timer);
  }, [themeMode]);

  const activeHour = adjustedHour ?? currentHour;

  const theme = getTheme(themeMode, activeHour);
  const gradient = buildGradient(theme, HORIZON_PCT, SHORE_PCT, BEACH_PCT);
  const waveColors = getWaveColors(theme);
  // opacity 게이트 제거 — 수평선 아래서 서서히 올라오는 효과를 위해 항상 위치 계산
  const sunPos = getSunPosition(themeMode, activeHour);
  const moonPos = getMoonPosition(themeMode, activeHour);

  return {
    themeMode,
    setThemeMode,
    currentHour,
    adjustedHour,
    setAdjustedHour,
    theme,
    gradient,
    waveColors,
    sunPos,
    moonPos,
  };
}
