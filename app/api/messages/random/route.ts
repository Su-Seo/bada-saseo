import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TAGS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const tagParam = req.nextUrl.searchParams.get("tag");
  const tag =
    tagParam && (TAGS as readonly string[]).includes(tagParam) ? tagParam : null;

  const where = {
    isDeleted: false,
    expiresAt: { gt: new Date() },
    ...(tag ? { tag } : {}),
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
      tag: true,
      bottleColor: true,
      paperStyle: true,
      heartCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ message }, { status: 200 });
}
