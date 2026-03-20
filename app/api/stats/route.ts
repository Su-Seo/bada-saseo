import { NextResponse } from "next/server";
import { getMessageStats } from "@/lib/message";
import { parseDateRange } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const range = parseDateRange(new URL(req.url).searchParams);
  if (!range.ok) return NextResponse.json({ error: range.error }, { status: 400 });

  const stats = await getMessageStats(range.from ?? undefined, range.to ?? undefined);
  return NextResponse.json(stats);
}