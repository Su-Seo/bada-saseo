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

/** 날짜 쿼리 파라미터 파싱 — Invalid Date면 null 반환 */
export function parseDate(param: string | null): Date | null {
  if (!param) return null;
  const d = new Date(param);
  return isNaN(d.getTime()) ? null : d;
}

export type DateRangeResult =
  | { ok: true; from: Date | null; to: Date | null }
  | { ok: false; error: string };

/** URLSearchParams에서 from/to를 파싱. 값이 있는데 Invalid Date면 ok: false 반환 */
export function parseDateRange(params: URLSearchParams): DateRangeResult {
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const from = parseDate(fromParam);
  const to = parseDate(toParam);

  if ((fromParam && !from) || (toParam && !to)) {
    return { ok: false, error: "날짜 형식이 올바르지 않습니다." };
  }
  return { ok: true, from, to };
}
