import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validMessageWhere } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await prisma.message.findMany({
    where: validMessageWhere(),
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, bottleColor: true },
  });

  return NextResponse.json({ messages });
}
