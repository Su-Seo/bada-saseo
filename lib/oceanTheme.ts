type RGB = [number, number, number];

export interface OceanTheme {
  // Sky (top → horizon)
  skyTop: RGB;
  skyBottom: RGB;
  horizon: RGB;
  // Ocean
  oceanTop: RGB;
  oceanBottom: RGB;
  // Sand
  wetSand: RGB;
  sandLight: RGB;
  sandDark: RGB;
  // Atmosphere
  starOpacity: number;
  moonOpacity: number;
  moonGlowOpacity: number;
  horizonGlowOpacity: number;
  sunOpacity: number;
}

// ── 시간대별 키프레임 ─────────────────────────────────

const MIDNIGHT: OceanTheme = {
  skyTop: [4, 8, 15],
  skyBottom: [16, 40, 74],
  horizon: [28, 68, 112],
  oceanTop: [21, 56, 96],
  oceanBottom: [7, 26, 51],
  wetSand: [10, 30, 46],
  sandLight: [61, 46, 26],
  sandDark: [138, 107, 64],
  starOpacity: 1,
  moonOpacity: 1,
  moonGlowOpacity: 0.06,
  horizonGlowOpacity: 0.12,
  sunOpacity: 0,
};

const DAWN: OceanTheme = {
  skyTop: [18, 18, 48],
  skyBottom: [130, 72, 85],
  horizon: [218, 145, 100],
  oceanTop: [32, 58, 95],
  oceanBottom: [16, 38, 65],
  wetSand: [24, 44, 58],
  sandLight: [90, 72, 48],
  sandDark: [158, 128, 88],
  starOpacity: 0.2,
  moonOpacity: 0.12,
  moonGlowOpacity: 0.02,
  horizonGlowOpacity: 0.25,
  sunOpacity: 0.4,
};

const MORNING: OceanTheme = {
  skyTop: [32, 115, 198],
  skyBottom: [82, 162, 224],
  horizon: [108, 186, 234],
  oceanTop: [12, 118, 172],   // 더 청량한 청록
  oceanBottom: [6, 70, 130],
  wetSand: [42, 125, 158],    // 얕은 물 느낌의 밝은 청록
  sandLight: [195, 178, 142], // 밝고 하얀 모래
  sandDark: [222, 205, 162],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.06,
  sunOpacity: 0.88,
};

const NOON: OceanTheme = {
  skyTop: [8, 85, 190],
  skyBottom: [48, 140, 212],
  horizon: [78, 170, 228],
  oceanTop: [8, 128, 192],    // 맑고 선명한 터콰이즈
  oceanBottom: [4, 72, 138],  // 깊고 투명한 딥블루
  wetSand: [38, 138, 172],    // 얕은 바닷물 청록
  sandLight: [210, 194, 155], // 밝고 깨끗한 백사장
  sandDark: [232, 215, 172],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.04,
  sunOpacity: 1,
};

const SUNSET: OceanTheme = {
  skyTop: [22, 30, 68],
  skyBottom: [160, 75, 58],
  horizon: [232, 145, 68],
  oceanTop: [32, 58, 88],
  oceanBottom: [18, 38, 60],
  wetSand: [28, 45, 55],
  sandLight: [108, 85, 55],
  sandDark: [178, 148, 102],
  starOpacity: 0.08,
  moonOpacity: 0.08,
  moonGlowOpacity: 0.01,
  horizonGlowOpacity: 0.3,
  sunOpacity: 0.4,
};

const DUSK: OceanTheme = {
  skyTop: [8, 10, 28],
  skyBottom: [24, 40, 72],
  horizon: [34, 58, 95],
  oceanTop: [22, 48, 82],
  oceanBottom: [10, 30, 54],
  wetSand: [14, 32, 44],
  sandLight: [68, 52, 32],
  sandDark: [145, 114, 70],
  starOpacity: 0.65,
  moonOpacity: 0.65,
  moonGlowOpacity: 0.04,
  horizonGlowOpacity: 0.14,
  sunOpacity: 0,
};

// NOON과 SUNSET 사이: 오후까지 맑은 낮 하늘 유지
const AFTERNOON: OceanTheme = {
  skyTop: [10, 88, 188],
  skyBottom: [52, 145, 215],
  horizon: [82, 172, 228],
  oceanTop: [10, 122, 182],   // 오후에도 청량함 유지
  oceanBottom: [5, 68, 132],
  wetSand: [40, 132, 165],    // 얕은 물 청록
  sandLight: [205, 188, 150], // 햇살 받은 밝은 모래
  sandDark: [228, 210, 168],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.04,
  sunOpacity: 0.95,
};

// 시간(0~24) → 키프레임 배열
const KEYFRAMES: { hour: number; theme: OceanTheme }[] = [
  { hour: 0, theme: MIDNIGHT },
  { hour: 5.5, theme: DAWN },
  { hour: 8, theme: MORNING },
  { hour: 12, theme: NOON },
  { hour: 15.5, theme: AFTERNOON },
  { hour: 18.5, theme: SUNSET },
  { hour: 20.5, theme: DUSK },
  { hour: 24, theme: MIDNIGHT }, // wrap
];

// ── 보간 유틸 ─────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

function lerpTheme(a: OceanTheme, b: OceanTheme, t: number): OceanTheme {
  return {
    skyTop: lerpRGB(a.skyTop, b.skyTop, t),
    skyBottom: lerpRGB(a.skyBottom, b.skyBottom, t),
    horizon: lerpRGB(a.horizon, b.horizon, t),
    oceanTop: lerpRGB(a.oceanTop, b.oceanTop, t),
    oceanBottom: lerpRGB(a.oceanBottom, b.oceanBottom, t),
    wetSand: lerpRGB(a.wetSand, b.wetSand, t),
    sandLight: lerpRGB(a.sandLight, b.sandLight, t),
    sandDark: lerpRGB(a.sandDark, b.sandDark, t),
    starOpacity: lerp(a.starOpacity, b.starOpacity, t),
    moonOpacity: lerp(a.moonOpacity, b.moonOpacity, t),
    moonGlowOpacity: lerp(a.moonGlowOpacity, b.moonGlowOpacity, t),
    horizonGlowOpacity: lerp(a.horizonGlowOpacity, b.horizonGlowOpacity, t),
    sunOpacity: lerp(a.sunOpacity, b.sunOpacity, t),
  };
}

// ── 공개 API ──────────────────────────────────────────

/** 시간(0~24, 소수점 가능)에 따른 테마 보간 */
export function getThemeForHour(hour: number): OceanTheme {
  const h = ((hour % 24) + 24) % 24; // normalize

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const curr = KEYFRAMES[i];
    const next = KEYFRAMES[i + 1];
    if (h >= curr.hour && h < next.hour) {
      const t = (h - curr.hour) / (next.hour - curr.hour);
      // smoothstep for natural transition
      const smooth = t * t * (3 - 2 * t);
      return lerpTheme(curr.theme, next.theme, smooth);
    }
  }
  return MIDNIGHT;
}

export const DARK_THEME = MIDNIGHT;
export const LIGHT_THEME = NOON;

// ── 그라디언트 빌더 ──────────────────────────────────

function rgb(c: RGB): string {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function rgbMix(a: RGB, b: RGB, t: number): string {
  return rgb(lerpRGB(a, b, t));
}

export function buildGradient(
  t: OceanTheme,
  horizonPct: number,
  shorePct: number,
  beachPct: number,
): string {
  const h = horizonPct * 100;
  const s = shorePct * 100;
  const b = beachPct * 100;

  return `linear-gradient(180deg,
    ${rgb(t.skyTop)} 0%,
    ${rgbMix(t.skyTop, t.skyBottom, 0.2)} 15%,
    ${rgbMix(t.skyTop, t.skyBottom, 0.55)} 28%,
    ${rgbMix(t.skyBottom, t.horizon, 0.3)} ${h - 3}%,
    ${rgbMix(t.skyBottom, t.horizon, 0.7)} ${h - 1}%,
    ${rgb(t.horizon)} ${h}%,
    ${rgbMix(t.horizon, t.oceanTop, 0.6)} ${h + 3}%,
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.25)} ${h + 10}%,
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.55)} ${h + 18}%,
    ${rgb(t.oceanBottom)} ${s - 3}%,
    ${rgbMix(t.oceanBottom, t.wetSand, 0.4)} ${s}%,
    ${rgb(t.wetSand)} ${b - 0.2}%,
    ${rgb(t.sandLight)} ${b + 0.4}%,
    ${rgbMix(t.sandLight, t.sandDark, 0.2)} ${b + 3}%,
    ${rgbMix(t.sandLight, t.sandDark, 0.5)} ${b + 10}%,
    ${rgbMix(t.sandLight, t.sandDark, 0.7)} 85%,
    ${rgbMix(t.sandLight, t.sandDark, 0.85)} 92%,
    ${rgb(t.sandDark)} 100%
  )`;
}

// ── 파도 색상 헬퍼 ────────────────────────────────────

export function getWaveColors(t: OceanTheme) {
  const dark = t.oceanBottom;
  const mid = lerpRGB(t.oceanTop, t.oceanBottom, 0.6);
  const isBright = t.sunOpacity > 0.5;

  if (isBright) {
    // 낮: 해변 파도는 자연스럽게, 포말만 살짝
    return {
      farFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.30)`,
      backFill: `rgba(${mid[0]},${mid[1]},${mid[2]},0.40)`,
      frontFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.50)`,
      nearFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.55)`,
      foamFill: `rgba(235,248,255,0.30)`,
    };
  }

  return {
    farFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.35)`,
    backFill: `rgba(${mid[0]},${mid[1]},${mid[2]},0.55)`,
    frontFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.65)`,
    nearFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.7)`,
    foamFill: `rgba(${Math.min(dark[0] + 170, 255)},${Math.min(dark[1] + 180, 255)},${Math.min(dark[2] + 185, 255)},0.09)`,
  };
}

export function getWashBackground(t: OceanTheme, variant: 1 | 2 | 3): string {
  const foam = lerpRGB(t.oceanTop, [200, 220, 240] as RGB, 0.7);
  const body = t.oceanBottom;
  const alphas = { 1: [0.14, 0.1, 0.35, 0.2, 0.08], 2: [0.12, 0.08, 0.3, 0.15, 0.05], 3: [0.1, 0.06, 0.22, 0.1] };
  const a = alphas[variant];

  if (variant === 3) {
    return `linear-gradient(180deg,
      rgba(${foam[0]},${foam[1]},${foam[2]},${a[0]}) 0%,
      rgba(${foam[0]},${foam[1]},${foam[2]},${a[1]}) 3%,
      rgba(${body[0]},${body[1]},${body[2]},${a[2]}) 8%,
      rgba(${body[0]},${body[1]},${body[2]},${a[3]}) 25%,
      transparent 50%
    )`;
  }

  return `linear-gradient(180deg,
    rgba(${foam[0]},${foam[1]},${foam[2]},${a[0]}) 0%,
    rgba(${foam[0]},${foam[1]},${foam[2]},${a[1]}) 3%,
    rgba(${body[0]},${body[1]},${body[2]},${a[2]}) 8%,
    rgba(${body[0]},${body[1]},${body[2]},${a[3]}) 30%,
    rgba(${body[0]},${body[1]},${body[2]},${a[4]}) 50%,
    transparent 75%
  )`;
}

/** 달빛 반사 색상 */
export function getMoonlightColor(t: OceanTheme): string {
  const base = lerpRGB(t.horizon, [180, 190, 210] as RGB, 0.5);
  return `linear-gradient(180deg, rgba(${base[0]},${base[1]},${base[2]},${t.moonGlowOpacity}) 0%, rgba(${base[0]},${base[1]},${base[2]},${t.moonGlowOpacity * 0.5}) 40%, transparent 100%)`;
}
