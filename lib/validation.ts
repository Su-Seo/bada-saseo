import { MAX_LENGTH } from "./constants";

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** 메시지 내용 검증 — 클라이언트/서버 공통 */
export function validateMessageContent(content: string): ValidationResult {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "마음을 담아 적어주세요." };
  if (trimmed.length > MAX_LENGTH)
    return { ok: false, error: `${MAX_LENGTH}자 이하로 작성해주세요.` };
  return { ok: true };
}
