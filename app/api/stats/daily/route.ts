import { NextResponse } from "next/server";
import { getMessageCountByDate } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const to = toParam ? new Date(toParam + "T23:59:59.999") : new Date();
  const from = fromParam ? new Date(fromParam) : new Date("2024-01-01");

  const data = await getMessageCountByDate(from, to);
  return NextResponse.json({ data });
}
