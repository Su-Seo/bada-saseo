import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 60; // 1분 캐시

/** GET /api/tags/stats — 태그별 메시지 수 */
export async function GET() {
  const [tags, grouped] = await Promise.all([
    prisma.tag.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.message.groupBy({
      by: ["tagId"],
      where: { isDeleted: false, expiresAt: { gt: new Date() }, tagId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    grouped.map((g) => [g.tagId as string, g._count._all])
  );

  const stats = tags.map((t) => ({
    name: t.name,
    count: countMap[t.id] ?? 0,
  }));

  return NextResponse.json({ stats });
}
