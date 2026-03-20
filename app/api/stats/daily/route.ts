import { NextResponse } from "next/server";
import { getMessageCountByDate } from "@/lib/message";
import { parseDateRange } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const range = parseDateRange(new URL(req.url).searchParams);
  if (!range.ok) return NextResponse.json({ error: range.error }, { status: 400 });

  const from = range.from ?? new Date("2024-01-01");
  const to = range.to ?? new Date();

  const data = await getMessageCountByDate(from, to);
  return NextResponse.json({ data });
}
