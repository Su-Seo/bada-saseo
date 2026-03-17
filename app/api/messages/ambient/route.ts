import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await prisma.message.findMany({
    where: {
      isDeleted: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true },
  });

  return NextResponse.json({ messages });
}
