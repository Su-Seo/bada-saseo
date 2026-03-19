import { NextResponse } from "next/server";
import { getWordFrequency } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam + "T23:59:59.999") : undefined;

  const words = await getWordFrequency(60, from, to);
  return NextResponse.json({ words });
}
