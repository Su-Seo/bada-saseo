import { NextResponse } from "next/server";
import { getWordFrequency } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const words = await getWordFrequency(60, from, to);
  return NextResponse.json({ words });
}
