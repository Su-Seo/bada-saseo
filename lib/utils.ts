export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Date → 'YYYY-MM-DD' 문자열 (UTC 기준) */
export function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** 날짜 문자열('YYYY-MM-DD')의 다음 날 반환. API to 파라미터를 exclusive end로 만들 때 사용 */
export function nextDay(dateStr: string) {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return toDateStr(d);
}
