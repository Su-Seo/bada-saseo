import { NextResponse } from "next/server";
import { findAmbientBottles } from "@/lib/message";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await findAmbientBottles();

  return NextResponse.json({ messages });
}
