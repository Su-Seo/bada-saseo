import { NextRequest, NextResponse } from "next/server";
import { findValidMessage, incrementHeart } from "@/lib/message";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!await findValidMessage(id)) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다." }, { status: 404 });
  }

  await incrementHeart(id);

  return NextResponse.json({ success: true });
}
