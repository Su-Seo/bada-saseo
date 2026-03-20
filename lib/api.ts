import type { ComposeOptions, MessageData } from "./types";

export type TodayBottleItem = MessageData & { createdAt: string };

/** GET JSON 유틸 — 실패 시 null 반환 */
export async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[fetchJSON] ${url}`, err);
    return null;
  }
}

/** 오늘 보낸 유리병 목록 조회. hearted=true이면 공감받은 것만 */
export function fetchTodayBottles(hearted: boolean) {
  return fetchJSON<TodayBottleItem[]>(`/api/messages/today?hearted=${hearted}`);
}

/** 오늘 병 개수 — 자루 시각화용 */
export function fetchTodayBagCounts() {
  return fetchJSON<{ unhearted: number; hearted: number }>("/api/messages/today/count");
}

/** 편지 작성 API 호출 — 전역 단일 정의 */
export async function postMessage(
  content: string,
  options: ComposeOptions
): Promise<{ ok: boolean; messageId?: string; bottleColor?: string | null; error?: string }> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, ...options }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data as { error?: string }).error ?? "오류가 발생했습니다." };
  }

  const data = await res.json().catch(() => ({})) as { messageId?: string; bottleColor?: string | null };
  return { ok: true, messageId: data.messageId, bottleColor: data.bottleColor ?? null };
}
