import type { ComposeOptions } from "./types";

/** GET JSON 유틸 — 실패 시 null 반환 */
export async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** 편지 작성 API 호출 — 전역 단일 정의 */
export async function postMessage(
  content: string,
  options: ComposeOptions
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, ...options }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: (data as { error?: string }).error ?? "오류가 발생했습니다." };
  }

  return { ok: true };
}
