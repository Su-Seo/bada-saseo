import { NextRequest, NextResponse } from "next/server";
import { findRandomMessage } from "@/lib/message";

export async function GET(req: NextRequest) {
  const tagParam = req.nextUrl.searchParams.get("tag");

  const message = await findRandomMessage(tagParam);

  return NextResponse.json({ message });
}
