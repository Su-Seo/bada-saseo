import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findValidMessage } from "@/lib/message";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!await findValidMessage(id)) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.message.update({
    where: { id },
    data: { heartCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
