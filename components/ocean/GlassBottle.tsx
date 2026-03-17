"use client";

interface Props {
  size?: number;       // rem 단위 높이 (기본 2.4)
  hasNote?: boolean;   // 편지가 들어있는지
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassBottle({ size = 2.4, hasNote, className = "", style }: Props) {
  const w = size * 0.38;  // 병 너비 비율
  const neckW = w * 0.38;
  const corkW = neckW * 1.15;

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
        }}
      />

      {/* 병 몸체 */}
      <div
        className="bottle-body"
        style={{
          width: `${w}rem`,
          height: `${size * 0.58}rem`,
          borderRadius: `${size * 0.06}rem ${size * 0.06}rem ${size * 0.1}rem ${size * 0.1}rem`,
        }}
      >
        {/* 유리 하이라이트 (왼쪽 반사광) */}
        <div className="bottle-highlight-left" />
        {/* 유리 하이라이트 (오른쪽 에지) */}
        <div className="bottle-highlight-right" />

        {/* 편지 */}
        {hasNote && (
          <div className="bottle-note">
            <div className="bottle-note-lines" />
          </div>
        )}
      </div>
    </div>
  );
}
