/**
 * 인메모리 rate limiter.
 * 서버리스 환경에서는 인스턴스 간 공유가 안 되므로
 * 프로덕션에서 정밀한 제어가 필요하다면 Redis(Upstash 등) 기반으로 교체 권장.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

/** 만료된 항목을 정리해 메모리 누수를 방지 */
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

/**
 * 주어진 key에 대해 rate limit을 검사한다.
 * @returns 요청 허용이면 true, 초과면 false
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** 요청 IP 추출 (프록시 환경 대응) */
export function getClientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "unknown")
    .split(",")[0]
    .trim();
}
