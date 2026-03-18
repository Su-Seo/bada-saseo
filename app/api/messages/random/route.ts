import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const tagParam = req.nextUrl.searchParams.get("tag");

  // DB에서 태그 유효성 확인 → tagId로 필터
  let tagId: string | null = null;
  if (tagParam) {
    const found = await prisma.tag.findFirst({
      where: { name: tagParam, isActive: true },
      select: { id: true },
    });
    tagId = found?.id ?? null;
  }

  const where = {
    isDeleted: false,
    expiresAt: { gt: new Date() },
    ...(tagId ? { tagId } : {}),
  };

  // 유효한 메시지 수 확인
  const count = await prisma.message.count({ where });

  if (count === 0) {
    return NextResponse.json({ message: null }, { status: 200 });
  }

  // 완전 랜덤 추출 (offset 방식)
  const skip = Math.floor(Math.random() * count);

  const message = await prisma.message.findFirst({
    where,
    skip,
    select: {
      id: true,
      content: true,
      tag: { select: { name: true } },
      bottleColor: true,
      paperStyle: true,
      heartCount: true,
      createdAt: true,
    },
  });

  // 응답에서 tag를 이름 문자열로 플랫화
  const { tag: tagRel, ...rest } = message!;
  return NextResponse.json({ message: { ...rest, tag: tagRel?.name ?? null } }, { status: 200 });
}
