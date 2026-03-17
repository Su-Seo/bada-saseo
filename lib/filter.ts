import { Filter } from "bad-words";

// 한국어 비속어 리스트 (기본값 — 필요 시 확장)
const KOREAN_BAD_WORDS = [
  "씨발", "씨팔", "시발", "ㅅㅂ",
  "개새끼", "개색끼", "ㄱㅅㄲ",
  "병신", "ㅂㅅ",
  "지랄", "ㅈㄹ",
  "미친놈", "미친년", "미친새끼",
  "존나", "ㅈㄴ",
  "좆", "보지", "자지",
  "창녀", "걸레",
  "nigger", "nigga",
];

const englishFilter = new Filter();

export function containsBadWords(text: string): boolean {
  // 영어 비속어 검사
  if (englishFilter.isProfane(text)) return true;

  // 한국어 비속어 검사
  const lower = text.toLowerCase();
  return KOREAN_BAD_WORDS.some((word) => lower.includes(word));
}
