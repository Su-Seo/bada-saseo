import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id },
    select: { isDeleted: true, expiresAt: true },
  });

  if (!message || message.isDeleted || message.expiresAt < new Date()) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.message.update({
    where: { id },
    data: { heartCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
