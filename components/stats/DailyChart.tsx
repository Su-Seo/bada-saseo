"use client";

import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api";

interface DayData {
  date: string;
  count: number;
}

interface Props {
  from: string;
  to: string;
}

function formatLabel(dateStr: string, totalDays: number) {
  const [, m, d] = dateStr.split("-").map(Number);
  if (totalDays <= 7) return `${m}/${d}`;
  if (totalDays <= 30) return d % 7 === 1 ? `${m}/${d}` : "";
  return d === 1 ? `${m}월` : "";
}

const W = 500;
const H = 100;
const PAD = { top: 10, right: 12, bottom: 24, left: 28 };

export default function DailyChart({ from, to }: Props) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = from && to ? `?from=${from}&to=${to}` : "";
    fetchJSON<{ data: DayData[] }>(`/api/stats/daily${q}`)
      .then((res) => { if (res?.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [from, to]);

  if (loading) {
    return (
      <div className="h-28 flex items-center justify-center text-white/30 text-xs">
        불러오는 중...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-white/30 text-xs">
        데이터가 없어요.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const n = data.length;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const px = (i: number) => PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
  const py = (count: number) => PAD.top + chartH - (count / max) * chartH;

  const points = data.map((d, i) => `${px(i)},${py(d.count)}`).join(" ");

  // 가이드라인 (0, max/2, max)
  const guides = [0, 0.5, 1].map((t) => ({
    y: PAD.top + chartH * (1 - t),
    val: Math.round(max * t),
  }));

  const totalDays = n;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height: 120 }}
      >
        {/* 가이드라인 */}
        {guides.map(({ y, val }) => (
          <g key={y}>
            <line
              x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3 3"
            />
            <text
              x={PAD.left - 4} y={y + 3.5}
              textAnchor="end" fontSize={7}
              fill="rgba(255,255,255,0.25)" fontFamily="Geist, sans-serif"
            >
              {val}
            </text>
          </g>
        ))}

        {/* 영역 채우기 */}
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon
          points={`${px(0)},${PAD.top + chartH} ${points} ${px(n - 1)},${PAD.top + chartH}`}
          fill="url(#lineAreaGrad)"
        />

        {/* 선 */}
        <polyline
          points={points}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* 데이터 포인트 */}
        {data.map((d, i) => (
          <circle key={d.date} cx={px(i)} cy={py(d.count)} r={2.5}
            fill="#7dd3fc" opacity={0.9}
          >
            <title>{d.date}: {d.count}건</title>
          </circle>
        ))}

        {/* x축 레이블 */}
        {data.map((d, i) => {
          const label = formatLabel(d.date, totalDays);
          if (!label) return null;
          return (
            <text
              key={d.date}
              x={px(i)} y={H - 2}
              textAnchor="middle" fontSize={7}
              fill="rgba(255,255,255,0.3)" fontFamily="Geist, sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>

      <p className="text-white/25 text-[10px] text-right mt-1">
        기간 합계 {data.reduce((s, d) => s + d.count, 0).toLocaleString()}건
      </p>
    </div>
  );
}
