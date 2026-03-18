import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { PAPER_STYLE_MAP, PaperStyle } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id, isDeleted: false },
    select: { content: true, tag: { select: { name: true } }, paperStyle: true },
  });

  if (!message) {
    return new Response("Not found", { status: 404 });
  }

  const paperBg =
    PAPER_STYLE_MAP[(message.paperStyle as PaperStyle) ?? "기본"]?.note ??
    "#faf5e8";

  // 긴 내용 말줄임
  const preview =
    message.content.length > 120
      ? message.content.slice(0, 117) + "..."
      : message.content;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #0d2040 40%, #122855 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 물결 효과 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(30,80,160,0.3) 0%, transparent 70%)",
          }}
        />

        {/* 편지 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "680px",
            background: paperBg,
            borderRadius: "24px",
            padding: "48px 52px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            position: "relative",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "rgba(100,80,60,0.6)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              바다사서
            </span>
            {message.tag && (
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(80,60,40,0.7)",
                  background: "rgba(0,0,0,0.07)",
                  borderRadius: "20px",
                  padding: "4px 14px",
                }}
              >
                {message.tag.name}
              </span>
            )}
          </div>

          {/* 내용 */}
          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.75,
              color: "rgba(60,45,30,0.88)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {preview}
          </p>

          {/* 장식선 */}
          <div
            style={{
              marginTop: "28px",
              height: "1px",
              background: "rgba(100,80,60,0.15)",
            }}
          />
          <p
            style={{
              marginTop: "16px",
              fontSize: "13px",
              color: "rgba(100,80,60,0.45)",
              textAlign: "right",
            }}
          >
            bada-saseo.vercel.app
          </p>
        </div>

        {/* 하단 물결 데코 */}
        <p
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.2em",
          }}
        >
          누군가의 마음이 바다를 건너왔어요
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
