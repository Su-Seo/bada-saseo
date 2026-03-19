import { NextResponse } from "next/server";
import { getMessageCountByDate } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const to = toParam ? new Date(toParam) : new Date();
  const from = fromParam
    ? new Date(fromParam)
    : new Date("2024-01-01"); // 전체 (서비스 시작일 이전)

  const data = await getMessageCountByDate(from, to);
  return NextResponse.json({ data });
}
