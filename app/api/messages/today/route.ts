import { NextRequest, NextResponse } from "next/server";
import { findTodayMessages, toMessageData } from "@/lib/message";

export async function GET(req: NextRequest) {
  const hearted = req.nextUrl.searchParams.get("hearted") === "true";
  const messages = await findTodayMessages(hearted);
  return NextResponse.json(messages.map(toMessageData));
}
