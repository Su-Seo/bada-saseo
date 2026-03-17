import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { containsBadWords } from "@/lib/filter";
import { MAX_LENGTH, EXPIRE_DAYS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.content !== "string") {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const content = body.content.trim();

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
    data: { content, expiresAt },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
