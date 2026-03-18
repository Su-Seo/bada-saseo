import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const WORDLIST_CACHE_TAG = "wordlist";

const fetchByType = unstable_cache(
  async (type: string): Promise<string[]> => {
    const rows = await prisma.wordList.findMany({
      where: { type, isActive: true },
      select: { word: true },
    });
    return rows.map((r) => r.word);
  },
  ["wordlist"],
  { tags: [WORDLIST_CACHE_TAG], revalidate: 3600 },
);

/** 불용어 목록 조회 (1시간 캐시) */
export function getStopwords(): Promise<string[]> {
  return fetchByType("stopword");
}

/** 비속어 목록 조회 (1시간 캐시) */
export function getBadWords(): Promise<string[]> {
  return fetchByType("badword");
}
