import { NextResponse } from "next/server";
import { getMessageStats } from "@/lib/message";

export async function GET() {
  const stats = await getMessageStats();

  return NextResponse.json(stats);
}
