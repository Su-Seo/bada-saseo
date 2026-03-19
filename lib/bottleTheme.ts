import { BottleColor, BOTTLE_COLOR_MAP, HEX_COLOR_RE } from "./constants";

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
  };
}

/** 병 색상 문자열 → base RGB 해석 */
export function getBottleBaseRgb(color: BottleColor | string | null | undefined): { r: number; g: number; b: number } {
  return (
    (color && HEX_COLOR_RE.test(color)
      ? hexToRgb(color)
      : BOTTLE_COLOR_MAP[(color as BottleColor) ?? "초록"]) ?? BOTTLE_COLOR_MAP["초록"]
  );
}

/** 그라디언트 색 정지점 (CSS / SVG 양쪽에서 사용) */
export interface GradientStop { offset: string; r: number; g: number; b: number; a: number }

export function getBottleBodyStops({ r, g, b }: { r: number; g: number; b: number }): GradientStop[] {
  return [
    { offset: "0%",   r: r-50, g: g-45, b: b-43, a: 0.4  },
    { offset: "20%",  r: r-20, g: g-20, b: b-18, a: 0.55 },
    { offset: "40%",  r,       g,       b,        a: 0.65 },
    { offset: "50%",  r: r+15, g: g+15, b: b+12, a: 0.7  },
    { offset: "60%",  r,       g,       b,        a: 0.65 },
    { offset: "80%",  r: r-20, g: g-20, b: b-18, a: 0.55 },
    { offset: "100%", r: r-50, g: g-45, b: b-43, a: 0.4  },
  ];
}

export function getBottleNeckStops({ r, g, b }: { r: number; g: number; b: number }): GradientStop[] {
  return [
    { offset: "0%",   r: r-30, g: g-25, b: b-23, a: 0.5  },
    { offset: "30%",  r: r+5,  g: g+5,  b: b+2,  a: 0.62 },
    { offset: "50%",  r: r+25, g: g+20, b: b+17, a: 0.7  },
    { offset: "70%",  r: r+5,  g: g+5,  b: b+2,  a: 0.62 },
    { offset: "100%", r: r-30, g: g-25, b: b-23, a: 0.5  },
  ];
}

function stopsToCSS(stops: GradientStop[]): string {
  return stops.map(s => `rgba(${s.r},${s.g},${s.b},${s.a}) ${s.offset}`).join(",\n      ");
}

/** CSS linear-gradient 문자열 (GlassBottle용) */
export function buildBottleGradient(color: BottleColor | string | null | undefined) {
  const base = getBottleBaseRgb(color);
  return {
    body: `linear-gradient(90deg, ${stopsToCSS(getBottleBodyStops(base))})`,
    neck: `linear-gradient(90deg, ${stopsToCSS(getBottleNeckStops(base))})`,
  };
}

/** 병 가장자리 stroke 색 */
export function getBottleEdgeColor({ r, g, b }: { r: number; g: number; b: number }, opacity: number): string {
  return `rgba(${r-40},${g-35},${b-33},${opacity})`;
}

/** 유리 하이라이트 색 */
export const BOTTLE_HIGHLIGHT = "rgba(210,245,235,0.55)";

/** 코르크 색 */
export const CORK_COLOR_DAY = "#c4a265";
export const CORK_COLOR_NIGHT = "#8a7040";
