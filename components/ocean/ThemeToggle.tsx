"use client";

import { useRef } from "react";
import { THEME_MODE } from "./hooks/useOceanTheme";
import type { ThemeMode } from "./hooks/useOceanTheme";

interface Props {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDaytime: boolean;
  currentHour: number;
  adjustedHour: number | null;
  setAdjustedHour: (h: number | null) => void;
}

function formatHour(h: number): string {
  const hours = Math.floor(h) % 24;
  const minutes = Math.round((h - Math.floor(h)) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function ClockDial({
  hour,
  isDaytime,
  onDrag,
}: {
  hour: number;
  isDaytime: boolean;
  onDrag: (h: number) => void;
}) {
  const SIZE = 64;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = SIZE / 2 - 6;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  // 진짜 시계처럼 12h 원형 좌표 (12 = 상단, 시계방향)
  const toXY = (h12: number, radius: number) => {
    const a = ((h12 / 12) * 360 - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const angleToHour = (px: number, py: number): number => {
    const deg = Math.atan2(py - cy, px - cx) * (180 / Math.PI) + 90;
    const normalized = ((deg % 360) + 360) % 360;
    const h12Raw = Math.round((normalized / 360) * 12 * 4) / 4; // 15분 스냅
    const h12 = h12Raw % 12; // 0~11.75

    // 현재 시간 기준으로 AM/PM 중 더 가까운 쪽 선택 → 자연스러운 전환
    const cur = hour % 24;
    const amOpt = h12;
    const pmOpt = h12 + 12;
    const dAM = Math.min(Math.abs(cur - amOpt), 24 - Math.abs(cur - amOpt));
    const dPM = Math.min(Math.abs(cur - pmOpt), 24 - Math.abs(cur - pmOpt));
    return dAM <= dPM ? amOpt : pmOpt;
  };

  const updateFromPointer = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    onDrag(angleToHour(e.clientX - rect.left, e.clientY - rect.top));
  };

  const h = hour % 24;
  const h12 = h % 12; // 시침은 12h 기준
  const isAM = h < 12;
  const isDayHour = h >= 5.5 && h <= 19.5;

  const fg = isDaytime ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)";
  const bright = isDaytime ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)";
  const handColor = isDayHour ? "rgba(255,215,60,0.95)" : "rgba(170,195,245,0.95)";

  // 12개 눈금
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const isMajor = i % 3 === 0;
    return {
      inner: toXY(i, R - (isMajor ? 5 : 2.5)),
      outer: toXY(i, R),
      major: isMajor,
    };
  });

  // 12, 3, 6, 9 레이블
  const labels = [
    { h12: 0, label: "12" },
    { h12: 3, label: "3" },
    { h12: 6, label: "6" },
    { h12: 9, label: "9" },
  ].map(({ h12: lh, label }) => ({ pos: toXY(lh, R - 10), label }));

  // 뾰족한 시침 (마름모 형태: 끝점 → 우측 → 꼬리 → 좌측)
  const handAngleDeg = (h12 / 12) * 360 - 90;
  const handRad = handAngleDeg * (Math.PI / 180);
  const perpRad = (handAngleDeg + 90) * (Math.PI / 180);
  const tipLen = R * 0.70;
  const tailLen = 5;
  const halfW = 2.0;
  const tip = { x: cx + tipLen * Math.cos(handRad), y: cy + tipLen * Math.sin(handRad) };
  const tail = { x: cx - tailLen * Math.cos(handRad), y: cy - tailLen * Math.sin(handRad) };
  const p1 = { x: cx + halfW * Math.cos(perpRad), y: cy + halfW * Math.sin(perpRad) };
  const p2 = { x: cx - halfW * Math.cos(perpRad), y: cy - halfW * Math.sin(perpRad) };
  const handPoints = `${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)} ${tail.x.toFixed(2)},${tail.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;

  return (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      style={{ cursor: "pointer", touchAction: "none", display: "block" }}
      onPointerDown={(e) => {
        dragging.current = true;
        svgRef.current?.setPointerCapture(e.pointerId);
        updateFromPointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging.current) updateFromPointer(e);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* 시계 테두리 */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={fg} strokeWidth={0.8} opacity={0.4} />

      {/* 눈금 */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.inner.x}
          y1={t.inner.y}
          x2={t.outer.x}
          y2={t.outer.y}
          stroke={fg}
          strokeWidth={t.major ? 1.2 : 0.7}
          opacity={t.major ? 0.7 : 0.25}
        />
      ))}

      {/* 12, 3, 6, 9 레이블 */}
      {labels.map(({ pos, label }) => (
        <text
          key={label}
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={fg}
          fontSize={label === "12" ? 5.5 : 6}
          opacity={0.65}
        >
          {label}
        </text>
      ))}

      {/* AM/PM 표시 */}
      <text
        x={cx}
        y={cy + 7}
        textAnchor="middle"
        dominantBaseline="central"
        fill={handColor}
        fontSize={5.5}
        opacity={0.85}
        fontWeight="600"
      >
        {isAM ? "AM" : "PM"}
      </text>

      {/* 뾰족한 시침 */}
      <polygon points={handPoints} fill={handColor} />

      {/* 중심점 */}
      <circle cx={cx} cy={cy} r={1.8} fill={bright} opacity={0.7} />
    </svg>
  );
}

export default function ThemeToggle({
  themeMode,
  setThemeMode,
  isDaytime,
  currentHour,
  adjustedHour,
  setAdjustedHour,
}: Props) {
  const btnActive = isDaytime ? "bg-black/20 text-white" : "bg-white/20 text-white/90";
  const btn = isDaytime
    ? "text-white/70 hover:text-white"
    : "text-white/30 hover:text-white/60";

  const displayHour = adjustedHour ?? currentHour;
  const isAuto = themeMode === THEME_MODE.AUTO;

  const handleClockDrag = (h: number) => {
    // 다른 모드에서 드래그하면 자동으로 AUTO 전환
    if (!isAuto) setThemeMode(THEME_MODE.AUTO);
    setAdjustedHour(h);
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {/* 버튼 행 */}
      <div className="flex items-center gap-1">
        {([THEME_MODE.AUTO, THEME_MODE.DARK, THEME_MODE.LIGHT] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setThemeMode(mode);
              if (mode === THEME_MODE.AUTO) setAdjustedHour(null); // 현재 시간으로 리셋
            }}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === mode ? btnActive : btn
            }`}
            aria-label={
              mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "현재 시간"
            }
            title={
              mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "현재 시간"
            }
          >
            {mode === THEME_MODE.DARK && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C13.92 3.04 13.46 3 12 3z" />
              </svg>
            )}
            {mode === THEME_MODE.LIGHT && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
              </svg>
            )}
            {mode === THEME_MODE.AUTO && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* 아날로그 시계 — 항상 표시, 드래그하면 AUTO로 전환 */}
      <div
        className="flex flex-col items-center gap-0.5 transition-opacity duration-500"
        style={{ opacity: isAuto ? 1 : 0.4 }}
      >
        <ClockDial
          hour={displayHour}
          isDaytime={isDaytime}
          onDrag={handleClockDrag}
        />
        <span
          className={`tabular-nums ${isDaytime ? "text-white/60" : "text-white/35"}`}
          style={{ fontSize: "0.6rem" }}
        >
          {formatHour(displayHour)}
        </span>
      </div>
    </div>
  );
}
