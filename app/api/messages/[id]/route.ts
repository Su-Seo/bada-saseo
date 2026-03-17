import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id, isDeleted: false },
    select: { id: true, content: true, tag: true, bottleColor: true, paperStyle: true, heartCount: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message });
}
