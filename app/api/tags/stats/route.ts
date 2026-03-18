import { NextResponse } from "next/server";
import { getTagStats } from "@/lib/message";

export const revalidate = 60; // 1분 캐시

/** GET /api/tags/stats — 태그별 메시지 수 */
export async function GET() {
  const stats = await getTagStats();

  return NextResponse.json({ stats });
}
