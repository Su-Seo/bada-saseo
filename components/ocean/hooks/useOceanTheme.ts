"use client";

import { useEffect, useRef, useState } from "react";
import {
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

// 각 모드의 목표 시각 (DARK=자정, LIGHT=정오, AUTO=현재 시각)
function getTargetHour(mode: ThemeMode, currentHour: number): number {
  switch (mode) {
    case THEME_MODE.DARK: return 0;
    case THEME_MODE.LIGHT: return 12;
    case THEME_MODE.AUTO: return currentHour;
  }
}

// 24시간 원형에서 최단 경로 델타 계산
function hourDelta(from: number, to: number): number {
  const forward = ((to - from) % 24 + 24) % 24;
  return forward <= 12 ? forward : forward - 24;
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
  const yOffset = 12;
  const sinVal = Math.sin(progress * Math.PI);
  const y = (horizonY + yOffset) - sinVal * (horizonY + yOffset - peakY);
  return { x, y };
}

const THEME_TRANSITION_DURATION = 1000; // ms

export function useOceanTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  // 서버/클라이언트 시간 차이는 시(hour) 단위이므로 hydration mismatch 위험 없음
  const [currentHour, setCurrentHour] = useState(getCurrentHour);
  // null = 실시간 추적, number = 사용자가 조절한 시간
  const [adjustedHour, setAdjustedHour] = useState<number | null>(null);

  useEffect(() => {
    if (themeMode !== THEME_MODE.AUTO) return;
    const timer = setInterval(() => setCurrentHour(getCurrentHour()), 10_000);
    return () => clearInterval(timer);
  }, [themeMode]);

  const activeHour = adjustedHour ?? currentHour;

  // 토글 시 시간이 실제로 흘러가는 애니메이션
  const [animatedHour, setAnimatedHour] = useState(() =>
    getTargetHour(DEFAULT_THEME_MODE, getCurrentHour())
  );
  const animatedHourRef = useRef(animatedHour);
  const prevThemeModeRef = useRef(themeMode);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const isModeChange = prevThemeModeRef.current !== themeMode;
    prevThemeModeRef.current = themeMode;

    const targetHour = getTargetHour(themeMode, activeHour);

    if (!isModeChange) {
      // 시계 드래그 또는 실시간 tick: 즉시 반영 (RAF로 effect 외부에서 setState 호출)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      animatedHourRef.current = targetHour;
      rafRef.current = requestAnimationFrame(() => {
        setAnimatedHour(animatedHourRef.current);
        rafRef.current = null;
      });
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }

    // 테마 모드 변경: 시간이 흘러가는 애니메이션
    const fromHour = animatedHourRef.current;
    const delta = hourDelta(fromHour, targetHour);
    const startTime = performance.now();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    function animate(now: number) {
      const t = Math.min((now - startTime) / THEME_TRANSITION_DURATION, 1);
      const smooth = t * t * (3 - 2 * t);
      const hour = fromHour + delta * smooth;
      animatedHourRef.current = hour;
      setAnimatedHour(hour);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [themeMode, activeHour]);

  // animatedHour 기준으로 테마/그라디언트 계산 (태양·달 위치도 함께 이동)
  // 애니메이션 중 hour가 24를 초과하거나 음수가 될 수 있으므로 정규화
  const normalizedHour = ((animatedHour % 24) + 24) % 24;
  const displayTheme = getThemeForHour(normalizedHour);
  const gradient = buildGradient(displayTheme, HORIZON_PCT, SHORE_PCT, BEACH_PCT);
  const waveColors = getWaveColors(displayTheme);
  const sunPos = getSunPosition(THEME_MODE.AUTO, normalizedHour);
  const moonPos = getMoonPosition(THEME_MODE.AUTO, normalizedHour);

  return {
    themeMode,
    setThemeMode,
    currentHour,
    adjustedHour,
    setAdjustedHour,
    animatedHour,
    theme: displayTheme,
    gradient,
    waveColors,
    sunPos,
    moonPos,
  };
}
