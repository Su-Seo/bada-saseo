import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const sinceParam = req.nextUrl.searchParams.get("since");
  let lastChecked = sinceParam ? new Date(sinceParam) : new Date();

  let closed = false;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      send({ type: "connected" });

      const startTime = Date.now();
      const MAX_DURATION = 25_000;

      while (!closed && Date.now() - startTime < MAX_DURATION) {
        await new Promise<void>((r) => setTimeout(r, 3000));
        if (closed) break;

        try {
          const messages = await prisma.message.findMany({
            where: {
              createdAt: { gt: lastChecked },
              isDeleted: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "asc" },
            select: { id: true, createdAt: true, bottleColor: true },
          });

          for (const msg of messages) {
            send({
              type: "bottle",
              messageId: msg.id,
              createdAt: msg.createdAt.toISOString(),
              bottleColor: msg.bottleColor ?? null,
            });
            lastChecked = msg.createdAt;
          }
        } catch {
          // DB 오류 시 다음 폴링까지 대기
        }
      }

      if (!closed) {
        send({ type: "reconnect", since: lastChecked.toISOString() });
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      closed = true;
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
