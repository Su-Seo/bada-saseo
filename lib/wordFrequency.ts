export interface WordEntry {
  word: string;
  count: number;
}

/**
 * 메시지 내용 목록에서 단어 빈도를 계산한다.
 * - 특수문자 제거 후 공백 기준 분리
 * - 2글자 이상, stopwords 제외
 * @param stopwords DB에서 조회한 불용어 목록
 */
export function computeWordFrequency(
  contents: string[],
  stopwords: ReadonlySet<string>,
  limit = 60,
): WordEntry[] {
  const freq = new Map<string, number>();

  for (const content of contents) {
    const words = content
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopwords.has(w));

    for (const word of words) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }

  return [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
