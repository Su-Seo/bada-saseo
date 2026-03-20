import { NextResponse } from "next/server";
import { deleteExpiredMessages } from "@/lib/message";

// 인증은 middleware에서 처리
export async function GET() {
  const deleted = await deleteExpiredMessages();
  return NextResponse.json({ deleted });
}
