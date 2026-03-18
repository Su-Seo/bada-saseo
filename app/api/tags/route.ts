import { NextResponse } from "next/server";
import { findActiveTags } from "@/lib/message";

export const revalidate = 300; // 5분 캐시

/** GET /api/tags — 활성 태그 목록 */
export async function GET() {
  const tags = await findActiveTags();
  return NextResponse.json({ tags });
}
