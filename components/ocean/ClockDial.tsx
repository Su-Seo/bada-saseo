"use client";

import { useRef, useEffect, useState } from "react";

export function ClockDial({
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
  // SSR에서 trigonometric 부동소수점 serialization mismatch 방지 — 클라이언트에서만 렌더링
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  // SSR에서는 동일한 크기의 빈 placeholder 렌더링
  if (!mounted) return <div style={{ width: SIZE, height: SIZE }} />;

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