import { NextResponse } from "next/server";
import { getWordFrequency } from "@/lib/message";

export const revalidate = 300;

export async function GET() {
  const words = await getWordFrequency(60);
  return NextResponse.json({ words });
}
