import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // 유효한 메시지 수 확인
  const count = await prisma.message.count({
    where: {
      isDeleted: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (count === 0) {
    return NextResponse.json({ message: null }, { status: 200 });
  }

  // 완전 랜덤 추출 (offset 방식)
  const skip = Math.floor(Math.random() * count);

  const message = await prisma.message.findFirst({
    where: {
      isDeleted: false,
      expiresAt: { gt: new Date() },
    },
    skip,
    select: {
      id: true,
      content: true,
      heartCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ message }, { status: 200 });
}
