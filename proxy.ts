import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// ── Edge Runtime 호환 상수 시간 비교 ─────────────────────────
// Node.js crypto.timingSafeEqual은 Edge에서 사용 불가.
// XOR 루프 방식으로 동일하게 타이밍 공격을 방지한다.
function verifySecret(
  provided: string | null,
  expected: string | undefined
): boolean {
  if (!provided || !expected || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const ERR_UNAUTHORIZED = { error: "Unauthorized" };
const ERR_RATE_LIMIT = { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." };

// ── Rate limit 규칙 ───────────────────────────────────────────
// 새 엔드포인트 추가 시 이 배열에만 항목을 추가하면 된다.
type RateLimitRule = {
  method: string;
  match: (pathname: string) => boolean;
  key: string;          // checkRateLimit 키 prefix
  limit: number;
  windowMs: number;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
  { method: "POST", match: (p) => p === "/api/messages",  key: "msg",    limit: 10, windowMs: 5 * 60 * 1000 },
  { method: "POST", match: (p) => p.endsWith("/heart"),   key: "heart",  limit: 30, windowMs:     60 * 1000 },
  { method: "POST", match: (p) => p.endsWith("/report"),  key: "report", limit: 10, windowMs: 60 * 60 * 1000 },
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 관리자 라우트 인증 ────────────────────────────────────
  if (pathname.startsWith("/api/admin/")) {
    if (!verifySecret(req.headers.get("x-admin-secret"), process.env.ADMIN_SECRET)) {
      return NextResponse.json(ERR_UNAUTHORIZED, { status: 401 });
    }
  }

  // ── Cron 라우트 인증 ──────────────────────────────────────
  if (pathname.startsWith("/api/cron/")) {
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/, "") ?? null;
    if (!verifySecret(bearer, process.env.CRON_SECRET)) {
      return NextResponse.json(ERR_UNAUTHORIZED, { status: 401 });
    }
  }

  // ── Rate limiting ─────────────────────────────────────────
  const rule = RATE_LIMIT_RULES.find(
    (r) => r.method === req.method && r.match(pathname)
  );
  if (rule) {
    const ip = getClientIp(req);
    if (!checkRateLimit(`${rule.key}:${ip}`, rule.limit, rule.windowMs)) {
      return NextResponse.json(ERR_RATE_LIMIT, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/cron/:path*",
    "/api/messages",
    "/api/messages/:path*",
  ],
};
