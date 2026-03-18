"use client";

import { BottleColor, PaperStyle, BOTTLE_COLOR_MAP, PAPER_STYLE_MAP, HEX_COLOR_RE } from "@/lib/constants";

interface Props {
  size?: number;
  hasNote?: boolean;
  bottleColor?: BottleColor | string | null;
  paperStyle?: PaperStyle | string | null;
  className?: string;
  style?: React.CSSProperties;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
  };
}

function buildBottleGradient(color: BottleColor | string | null | undefined) {
  const base =
    (color && HEX_COLOR_RE.test(color)
      ? hexToRgb(color)
      : BOTTLE_COLOR_MAP[(color as BottleColor) ?? "초록"]) ?? BOTTLE_COLOR_MAP["초록"];
  const { r, g, b } = base;
  return {
    body: `linear-gradient(90deg,
      rgba(${r-50},${g-45},${b-43},0.4) 0%,
      rgba(${r-20},${g-20},${b-18},0.55) 20%,
      rgba(${r},${g},${b},0.65) 40%,
      rgba(${r+15},${g+15},${b+12},0.7) 50%,
      rgba(${r},${g},${b},0.65) 60%,
      rgba(${r-20},${g-20},${b-18},0.55) 80%,
      rgba(${r-50},${g-45},${b-43},0.4) 100%
    )`,
    neck: `linear-gradient(90deg,
      rgba(${r-30},${g-25},${b-23},0.5) 0%,
      rgba(${r+5},${g+5},${b+2},0.62) 30%,
      rgba(${r+25},${g+20},${b+17},0.7) 50%,
      rgba(${r+5},${g+5},${b+2},0.62) 70%,
      rgba(${r-30},${g-25},${b-23},0.5) 100%
    )`,
  };
}

export default function GlassBottle({ size = 2.4, hasNote, bottleColor, paperStyle, className = "", style }: Props) {
  const w = size * 0.38;
  const neckW = w * 0.38;
  const corkW = neckW * 1.15;
  const gradient = buildBottleGradient(bottleColor);
  const noteColor = PAPER_STYLE_MAP[(paperStyle as PaperStyle) ?? "기본"]?.bg ?? PAPER_STYLE_MAP["기본"].bg;

  return (
    <div
      className={`glass-bottle ${className}`}
      style={{
        height: `${size}rem`,
        width: `${w}rem`,
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
    >
      {/* 코르크 */}
      <div
        className="bottle-cork"
        style={{
          width: `${corkW}rem`,
          height: `${size * 0.12}rem`,
          borderRadius: `${size * 0.03}rem ${size * 0.03}rem ${size * 0.015}rem ${size * 0.015}rem`,
        }}
      />

      {/* 병 목 */}
      <div
        className="bottle-neck"
        style={{
          width: `${neckW}rem`,
          height: `${size * 0.22}rem`,
          borderRadius: `${size * 0.02}rem ${size * 0.02}rem 0 0`,
          background: gradient.neck,
        }}
      />

      {/* 병 몸체 */}
      <div
        className="bottle-body"
        style={{
          width: `${w}rem`,
          height: `${size * 0.58}rem`,
          borderRadius: `${size * 0.06}rem ${size * 0.06}rem ${size * 0.1}rem ${size * 0.1}rem`,
          background: gradient.body,
        }}
      >
        <div className="bottle-highlight-left" />
        <div className="bottle-highlight-right" />

        {hasNote && (
          <div className="bottle-note" style={{ background: noteColor }}>
            <div className="bottle-note-lines" />
          </div>
        )}
      </div>
    </div>
  );
}
