import type { Tag, BottleColor, PaperStyle } from "./constants";

/** API에서 받아오는 메시지 데이터 — 전역 단일 정의 */
export interface MessageData {
  id: string;
  content: string;
  tag?: string | null;
  bottleColor?: string | null;
  paperStyle?: string | null;
  heartCount: number;
}

/** 편지 작성 시 커스터마이징 옵션 — 전역 단일 정의 */
export interface ComposeOptions {
  tag: Tag | null;
  bottleColor: BottleColor;
  paperStyle: PaperStyle;
}

export const DEFAULT_COMPOSE_OPTIONS: ComposeOptions = {
  tag: null,
  bottleColor: "초록",
  paperStyle: "기본",
};
