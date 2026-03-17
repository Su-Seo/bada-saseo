import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { containsBadWords } from "@/lib/filter";
import { MAX_LENGTH, EXPIRE_DAYS, BOTTLE_COLORS, PAPER_STYLES } from "@/lib/constants";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.content !== "string") {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const content = body.content.trim();

  // 태그: DB에서 유효성 확인
  let tag: string | null = null;
  if (body.tag && typeof body.tag === "string") {
    const found = await prisma.tag.findFirst({
      where: { name: body.tag, isActive: true },
      select: { name: true },
    });
    tag = found?.name ?? null;
  }

  // 병 색상: 프리셋 이름 또는 #rrggbb hex
  const bottleColor: string | null =
    body.bottleColor &&
    ((BOTTLE_COLORS as readonly string[]).includes(body.bottleColor) ||
      HEX_RE.test(body.bottleColor))
      ? body.bottleColor
      : null;

  // 편지지: 프리셋 이름만 허용
  const paperStyle: string | null =
    body.paperStyle && (PAPER_STYLES as readonly string[]).includes(body.paperStyle)
      ? body.paperStyle
      : null;

  if (content.length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  if (content.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `${MAX_LENGTH}자 이하로 작성해주세요.` },
      { status: 400 }
    );
  }

  if (containsBadWords(content)) {
    return NextResponse.json(
      { error: "부적절한 표현이 포함되어 있습니다." },
      { status: 400 }
    );
  }

  const expiresAt = new Date(Date.now() + EXPIRE_DAYS * 24 * 60 * 60 * 1000);

  await prisma.message.create({
    data: { content, tag, bottleColor, paperStyle, expiresAt },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
