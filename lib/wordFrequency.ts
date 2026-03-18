/** 불용어 목록 (어절 단위로 완전 일치) */
const STOPWORDS = new Set([
  // 지시어
  "이것", "저것", "그것", "이거", "저거", "그거",
  "이게", "그게", "저게", "이건", "그건", "저건",
  "이런", "저런", "그런", "이렇게", "저렇게", "그렇게",
  // 접속사
  "그리고", "그래서", "하지만", "그런데", "근데", "그러면",
  "따라서", "그래도", "왜냐면", "그러나", "또한", "또는",
  "그렇지만", "그러므로", "그러나",
  // 부정/강조 부사
  "정말로", "진짜로",
]);

export interface WordEntry {
  word: string;
  count: number;
}

/**
 * 메시지 내용 목록에서 단어 빈도를 계산한다.
 * - 특수문자 제거 후 공백 기준 분리
 * - 2글자 이상, 불용어 제외
 */
export function computeWordFrequency(contents: string[], limit = 60): WordEntry[] {
  const freq = new Map<string, number>();

  for (const content of contents) {
    const words = content
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

    for (const word of words) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
