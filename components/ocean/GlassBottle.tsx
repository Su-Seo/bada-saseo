"use client";

import { PaperStyle, PAPER_STYLE_MAP } from "@/lib/constants";
import { buildBottleGradient } from "@/lib/bottleTheme";
import type { BottleColor } from "@/lib/constants";

interface Props {
  size?: number;
  hasNote?: boolean;
  bottleColor?: BottleColor | string | null;
  paperStyle?: PaperStyle | string | null;
  className?: string;
  style?: React.CSSProperties;
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
