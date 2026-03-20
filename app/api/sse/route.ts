import { NextRequest } from "next/server";
import { Client } from "pg";
import { findNewBottlesSince } from "@/lib/message";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const sinceParam = req.nextUrl.searchParams.get("since");
  const parsed = sinceParam ? new Date(sinceParam) : new Date();
  // 최대 24시간 과거까지만 허용 (Invalid Date 및 너무 오래된 값 방어)
  const MAX_LOOKBACK_MS = 24 * 60 * 60 * 1000;
  const since = isNaN(parsed.getTime()) || Date.now() - parsed.getTime() > MAX_LOOKBACK_MS
    ? new Date(Date.now() - MAX_LOOKBACK_MS)
    : parsed;

  const encoder = new TextEncoder();
  let client: Client | null = null;
  let cancelResolve: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          cancelResolve?.();
        }
      };

      // LISTEN 전용 pg 클라이언트 (Prisma 풀과 별도)
      client = new Client({ connectionString: process.env.DATABASE_URL! });
      try {
        await client.connect();
      } catch {
        try { controller.close(); } catch { /* ignore */ }
        return;
      }

      send({ type: "connected" });

      let lastSince = since;

      // 재연결 간격 동안 놓친 메시지 catch-up
      try {
        const missed = await findNewBottlesSince(since);
        for (const msg of missed) {
          send({
            type: "bottle",
            messageId: msg.id,
            createdAt: msg.createdAt.toISOString(),
            bottleColor: msg.bottleColor ?? null,
          });
          lastSince = msg.createdAt;
        }
      } catch {
        // catch-up 실패 시 무시하고 LISTEN으로 계속
      }

      // 새 메시지 push 핸들러
      client.on("notification", (msg) => {
        if (!msg.payload) return;
        try {
          const payload = JSON.parse(msg.payload) as {
            id: string;
            createdAt: string;
            bottleColor: string | null;
          };
          lastSince = new Date(payload.createdAt);
          send({
            type: "bottle",
            messageId: payload.id,
            createdAt: payload.createdAt,
            bottleColor: payload.bottleColor,
          });
        } catch {
          // 잘못된 payload 무시
        }
      });

      await client.query("LISTEN new_bottle");

      // 25초 대기 (Vercel maxDuration 대응) — cancel 시 조기 종료
      await new Promise<void>((resolve) => {
        cancelResolve = resolve;
        setTimeout(resolve, 25_000);
      });
      cancelResolve = null;

      try {
        send({ type: "reconnect", since: lastSince.toISOString() });
        controller.close();
      } catch {
        // already closed
      }

      try { await client.end(); } catch { /* ignore */ }
    },
    cancel() {
      cancelResolve?.();
      client?.end().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
