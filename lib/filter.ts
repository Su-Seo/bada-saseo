import { Filter } from "bad-words";
import { getBadWords } from "./wordList";

const englishFilter = new Filter();

/** 비속어 포함 여부 검사 (DB 기반 한국어 + bad-words 영어) */
export async function containsBadWords(text: string): Promise<boolean> {
  if (englishFilter.isProfane(text)) return true;

  const badWords = await getBadWords();
  const lower = text.toLowerCase();
  return badWords.some((word) => lower.includes(word));
}
