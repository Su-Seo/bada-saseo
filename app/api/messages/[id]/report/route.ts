import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REPORT_THRESHOLD } from "@/lib/constants";
import { findValidMessage } from "@/lib/message";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await findValidMessage(id);
  if (!message) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  const newCount = message.reportCount + 1;
  const shouldDelete = newCount >= REPORT_THRESHOLD;

  await prisma.message.update({
    where: { id },
    data: {
      reportCount: { increment: 1 },
      ...(shouldDelete && { isDeleted: true }),
    },
  });

  return NextResponse.json({ success: true });
}
