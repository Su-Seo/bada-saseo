import { NextResponse } from "next/server";
import { countTodayMessages } from "@/lib/message";

export async function GET() {
  const counts = await countTodayMessages();
  return NextResponse.json(counts);
}
