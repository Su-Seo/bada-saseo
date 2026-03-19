import { NextResponse } from "next/server";
import { getMessageStats } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const stats = await getMessageStats(from, to);
  return NextResponse.json(stats);
}
