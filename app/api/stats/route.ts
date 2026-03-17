import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayCount, totalCount] = await Promise.all([
    prisma.message.count({
      where: {
        createdAt: { gte: todayStart },
        isDeleted: false,
      },
    }),
    prisma.message.count({
      where: {
        isDeleted: false,
        expiresAt: { gt: new Date() },
      },
    }),
  ]);

  return NextResponse.json({ todayCount, totalCount });
}
