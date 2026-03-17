import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 300; // 5분 캐시

/** GET /api/tags — 활성 태그 목록 */
export async function GET() {
  const tags = await prisma.tag.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json({ tags });
}
