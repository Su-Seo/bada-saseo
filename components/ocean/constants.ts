// ── 씬 비율 상수 ──────────────────────────────────────
export const HORIZON_PCT = 0.37;
export const SHORE_PCT = 0.67;
export const BEACH_PCT = 0.69;
export const MAX_BOTTLES = 6;
export const MAX_BEACH_BOTTLES = 5;
export const BEACH_SPAWN_MS = 10_000;

// ── 유틸 ──────────────────────────────────────────────
export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
