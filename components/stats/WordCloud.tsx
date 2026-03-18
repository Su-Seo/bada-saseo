"use client";

import { useEffect, useRef, useState } from "react";
import type { WordEntry } from "@/lib/wordFrequency";

interface PlacedWord {
  word: string;
  count: number;
  x: number;
  y: number;
  fontSize: number;
  rotate: number;
  color: string;
}

interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const COLORS = [
  "#7dd3fc", "#67e8f9", "#5eead4",
  "#c4b5fd", "#d8b4fe", "#fda4af",
  "#6ee7b7", "#93c5fd", "#fde68a",
  "#f9a8d4", "#86efac", "#fdba74",
];

const PAD = 5;

function bboxOverlaps(a: BBox, boxes: BBox[]): boolean {
  for (const b of boxes) {
    if (
      a.x1 - PAD < b.x2 &&
      a.x2 + PAD > b.x1 &&
      a.y1 - PAD < b.y2 &&
      a.y2 + PAD > b.y1
    ) {
      return true;
    }
  }
  return false;
}

function measureWord(text: string, fontSize: number): { w: number; h: number } {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `600 ${fontSize}px Geist, sans-serif`;
    return { w: ctx.measureText(text).width + 4, h: fontSize * 1.2 };
  } catch {
    return { w: text.length * fontSize * 0.6, h: fontSize * 1.2 };
  }
}

function layout(words: WordEntry[], W: number, H: number): PlacedWord[] {
  const max = words[0].count;
  const min = words[words.length - 1].count;
  const spread = Math.max(max - min, 1);

  const cx = W / 2;
  const cy = H / 2;
  const boxes: BBox[] = [];
  const result: PlacedWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const { word, count } = words[i];
    const t = (count - min) / spread;
    const fontSize = Math.round(12 + t * 28); // 12px ~ 40px

    // 상위 단어는 항상 가로, 나머지는 30% 확률로 세로
    const rotate = i < 4 ? 0 : Math.random() < 0.3 ? 90 : 0;

    const { w: tw, h: th } = measureWord(word, fontSize);
    // 회전 시 bounding box 교환
    const bw = rotate === 90 ? th : tw;
    const bh = rotate === 90 ? tw : th;

    // 아르키메데스 나선으로 배치 위치 탐색
    let placed = false;
    for (let step = 0; step < 4000; step++) {
      const angle = step * 0.22;
      const r = step * 0.65;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle) * 0.55; // 타원형 (가로 넓게)

      const box: BBox = {
        x1: px - bw / 2,
        y1: py - bh / 2,
        x2: px + bw / 2,
        y2: py + bh / 2,
      };

      if (box.x1 < 2 || box.x2 > W - 2 || box.y1 < 2 || box.y2 > H - 2) continue;

      if (!bboxOverlaps(box, boxes)) {
        boxes.push(box);
        result.push({
          word,
          count,
          x: px,
          y: py,
          fontSize,
          rotate,
          color: COLORS[i % COLORS.length],
        });
        placed = true;
        break;
      }
    }

    // 자리를 못 찾으면 스킵
    void placed;
  }

  return result;
}

interface Props {
  words: WordEntry[];
}

export default function WordCloud({ words }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<PlacedWord[]>([]);
  const [svgH, setSvgH] = useState(0);

  useEffect(() => {
    if (words.length === 0) return;

    const run = () => {
      const el = ref.current;
      if (!el) return;
      const W = el.offsetWidth;
      if (W === 0) {
        requestAnimationFrame(run);
        return;
      }
      const H = Math.max(Math.round(W * 0.62), 260);
      setSvgH(H);
      setPlaced(layout(words, W, H));
    };

    run();
  }, [words]);

  if (words.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">아직 편지가 없어요.</p>;
  }

  return (
    <div ref={ref} className="w-full">
      {svgH > 0 && (
        <svg width="100%" height={svgH}>
          {placed.map((p) => (
            <text
              key={p.word}
              x={p.x}
              y={p.y}
              fontSize={p.fontSize}
              fill={p.color}
              fontWeight={600}
              fontFamily="Geist, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              transform={p.rotate !== 0 ? `rotate(${p.rotate}, ${p.x}, ${p.y})` : undefined}
              opacity={0.85}
            >
              <title>{p.word} ({p.count}회)</title>
              {p.word}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}
