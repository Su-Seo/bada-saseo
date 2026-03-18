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
  skyTop: [52, 135, 210],
  skyBottom: [105, 182, 235],
  horizon: [182, 218, 242],   // 밝고 안개낀 수평선
  oceanTop: [0, 148, 195],
  oceanBottom: [0, 95, 158],
  wetSand: [28, 155, 188],
  sandLight: [195, 178, 142],
  sandDark: [222, 205, 162],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.18,
  sunOpacity: 0.88,
};

const NOON: OceanTheme = {
  skyTop: [68, 152, 224],
  skyBottom: [108, 188, 238],
  horizon: [192, 224, 246],   // 밝고 선명한 수평선
  oceanTop: [0, 162, 218],
  oceanBottom: [0, 102, 168],
  wetSand: [22, 172, 200],
  sandLight: [210, 194, 155],
  sandDark: [232, 215, 172],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.15,
  sunOpacity: 1,
};

// NOON과 SUNSET 사이: 오후까지 맑은 낮 하늘 유지
const AFTERNOON: OceanTheme = {
  skyTop: [62, 142, 218],
  skyBottom: [102, 178, 232],
  horizon: [188, 222, 244],   // 오후 수평선도 밝고 선명하게
  oceanTop: [0, 155, 208],
  oceanBottom: [0, 98, 162],
  wetSand: [25, 165, 195],
  sandLight: [205, 188, 150],
  sandDark: [228, 210, 168],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.15,
  sunOpacity: 0.95,
};

// 황금빛 노을 시작 — 하늘은 아직 파랗고 수평선만 따뜻해짐
const GOLDEN_HOUR: OceanTheme = {
  skyTop: [32, 122, 205],
  skyBottom: [218, 145, 88],
  horizon: [238, 168, 88],
  oceanTop: [8, 132, 180],
  oceanBottom: [5, 78, 142],
  wetSand: [28, 118, 152],
  sandLight: [198, 175, 130],
  sandDark: [220, 195, 148],
  starOpacity: 0,
  moonOpacity: 0,
  moonGlowOpacity: 0,
  horizonGlowOpacity: 0.18,
  sunOpacity: 0.75,
};  

const SUNSET: OceanTheme = {
  skyTop: [62, 78, 148],
  skyBottom: [188, 105, 72],
  horizon: [235, 148, 68],
  oceanTop: [32, 58, 88],
  oceanBottom: [18, 38, 60],
  wetSand: [28, 45, 55],
  sandLight: [108, 85, 55],
  sandDark: [178, 148, 102],
  starOpacity: 0.05,
  moonOpacity: 0.05,
  moonGlowOpacity: 0.01,
  horizonGlowOpacity: 0.32,
  sunOpacity: 0.35,
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

// 시간(0~24) → 키프레임 배열
const KEYFRAMES: { hour: number; theme: OceanTheme }[] = [
  { hour: 0, theme: MIDNIGHT },
  { hour: 5.5, theme: DAWN },
  { hour: 8, theme: MORNING },
  { hour: 12, theme: NOON },
  { hour: 15.5, theme: AFTERNOON },
  { hour: 17.5, theme: GOLDEN_HOUR },
  { hour: 19.5, theme: SUNSET },
  { hour: 21.5, theme: DUSK },
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
    /* 하늘 꼭대기 */
    ${rgb(t.skyTop)} 0%,
    /* 하늘 상단 */
    ${rgbMix(t.skyTop, t.skyBottom, 0.2)} ${h * 0.1}%,
    /* 하늘 중단 */
    ${rgbMix(t.skyTop, t.skyBottom, 0.55)} ${h * 0.4}%,
    /* 하늘 하단 → 수평선 전환 시작 */
    ${rgbMix(t.skyBottom, t.horizon, 0.3)} ${h - 8}%,
    /* 수평선 직전 */
    ${rgbMix(t.skyBottom, t.horizon, 0.7)} ${h - 4}%,
    /* 수평선 */
    ${rgb(t.horizon)} ${h}%,
    /* 수평선 → 바다 전환 */
    ${rgbMix(t.horizon, t.oceanTop, 0.5)} ${h + 1}%,
    /* 바다 상단 (먼 바다) */
    ${rgb(t.oceanTop)} ${h + 4}%,
    /* 바다 상단 → 중단 */
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.2)} ${h + 10}%,
    /* 바다 중단 */
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.4)} ${h + 16}%,
    /* 바다 중하단 */
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.6)} ${s - 4}%,
    /* 바다 하단 */
    ${rgbMix(t.oceanTop, t.oceanBottom, 0.9)} ${s - 2}%,
    /* 바다 가장 깊은 곳 */
    ${rgb(t.oceanBottom)} ${s}%,
    /* 바다 → 젖은 모래 전환 */
    ${rgbMix(t.oceanBottom, t.wetSand, 0.3)} ${s + 1}%,
    /* 젖은 모래 */
    ${rgbMix(t.oceanBottom, t.wetSand, 0.7)} ${s + 3}%,
    /* 마른 모래 시작 */
    ${rgb(t.sandLight)} ${b}%,
    /* 모래 상단 */
    ${rgbMix(t.sandLight, t.sandDark, 0.2)} ${b + 3}%,
    /* 모래 중단 */
    ${rgbMix(t.sandLight, t.sandDark, 0.5)} ${b + 10}%,
    /* 모래 하단 */
    ${rgbMix(t.sandLight, t.sandDark, 0.7)} 85%,
    /* 모래 깊은 곳 */
    ${rgbMix(t.sandLight, t.sandDark, 0.85)} 92%,
    /* 모래 맨 아래 */
    ${rgb(t.sandDark)} 100%
  )`;
}

// ── 파도 색상 헬퍼 ────────────────────────────────────

export function getWaveColors(t: OceanTheme) {
  const far = lerpRGB(t.oceanTop, t.oceanBottom, 0.3);
  const mid = lerpRGB(t.oceanTop, t.oceanBottom, 0.55);
  const near = lerpRGB(t.oceanTop, t.oceanBottom, 0.75);
  const dark = t.oceanBottom;
  const foam = lerpRGB(t.oceanTop, [220, 235, 248] as RGB, 0.6);
  const isBright = t.sunOpacity > 0.5;

  if (isBright) {
    return {
      farFill: `rgba(${far[0]},${far[1]},${far[2]},0.28)`,
      backFill: `rgba(${mid[0]},${mid[1]},${mid[2]},0.38)`,
      frontFill: `rgba(${near[0]},${near[1]},${near[2]},0.48)`,
      nearFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.52)`,
      foamFill: `rgba(${foam[0]},${foam[1]},${foam[2]},0.28)`,
    };
  }

  return {
    farFill: `rgba(${far[0]},${far[1]},${far[2]},0.32)`,
    backFill: `rgba(${mid[0]},${mid[1]},${mid[2]},0.50)`,
    frontFill: `rgba(${near[0]},${near[1]},${near[2]},0.60)`,
    nearFill: `rgba(${dark[0]},${dark[1]},${dark[2]},0.65)`,
    foamFill: `rgba(${foam[0]},${foam[1]},${foam[2]},0.08)`,
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
