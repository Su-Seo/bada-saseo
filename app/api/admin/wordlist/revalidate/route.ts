import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { WORDLIST_CACHE_TAG } from "@/lib/wordList";

// 인증은 middleware에서 처리
export async function POST() {
  revalidateTag(WORDLIST_CACHE_TAG, {});
  return NextResponse.json({ ok: true });
}
