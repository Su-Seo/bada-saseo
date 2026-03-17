export const MAX_LENGTH = 500;
export const EXPIRE_DAYS = 7;
export const REPORT_THRESHOLD = 3;

export const TAGS = ["연애", "진로", "가족", "친구", "건강", "일상", "기타"] as const;
export type Tag = (typeof TAGS)[number];

export const BOTTLE_COLORS = ["초록", "파랑", "보라", "분홍", "호박"] as const;
export type BottleColor = (typeof BOTTLE_COLORS)[number];

export const PAPER_STYLES = ["기본", "낡은", "분홍", "파랑"] as const;
export type PaperStyle = (typeof PAPER_STYLES)[number];

// 병 색상별 RGB 기준값 (bottle-body 그라디언트 중심색)
export const BOTTLE_COLOR_MAP: Record<BottleColor, { r: number; g: number; b: number }> = {
  초록: { r: 130, g: 195, b: 178 },
  파랑: { r: 100, g: 155, b: 225 },
  보라: { r: 155, g: 120, b: 215 },
  분홍: { r: 220, g: 135, b: 170 },
  호박: { r: 210, g: 165, b: 85 },
};

// 편지지 스타일별 색상 (MessageCard 배경, 병 속 종이)
export const PAPER_STYLE_MAP: Record<PaperStyle, { bg: string; note: string; label: string }> = {
  기본:  { bg: "rgba(245,235,210,0.85)", note: "#faf5e8", label: "크림" },
  낡은:  { bg: "rgba(210,185,145,0.85)", note: "#e8d8b0", label: "앤틱" },
  분홍:  { bg: "rgba(245,215,225,0.85)", note: "#fde8f0", label: "분홍" },
  파랑:  { bg: "rgba(210,230,245,0.85)", note: "#e4f0fb", label: "하늘" },
};
