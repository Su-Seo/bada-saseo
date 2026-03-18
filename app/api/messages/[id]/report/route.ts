import { NextRequest, NextResponse } from "next/server";
import { reportMessage } from "@/lib/message";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const found = await reportMessage(id);
  if (!found) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
