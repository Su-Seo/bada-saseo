export const MAX_LENGTH = 500;
export const EXPIRE_DAYS = 7;
export const REPORT_THRESHOLD = 3;

export const TAGS = ["연애", "진로", "가족", "친구", "건강", "일상", "기타"] as const;
export type Tag = (typeof TAGS)[number];
