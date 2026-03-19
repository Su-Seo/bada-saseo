import { NextResponse } from "next/server";
import { getTagStats } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const stats = await getTagStats(from, to);
  return NextResponse.json({ stats });
}
