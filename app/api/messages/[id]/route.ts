import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MESSAGE_SELECT, toMessageData } from "@/lib/message";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id, isDeleted: false },
    select: MESSAGE_SELECT,
  });

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message: toMessageData(message) });
}
