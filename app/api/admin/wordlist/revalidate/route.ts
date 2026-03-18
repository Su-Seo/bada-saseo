import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { WORDLIST_CACHE_TAG } from "@/lib/wordList";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(WORDLIST_CACHE_TAG, {});
  return NextResponse.json({ ok: true });
}
