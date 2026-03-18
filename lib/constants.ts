export const MAX_LENGTH = 500;
export const EXPIRE_DAYS = 7;
export const REPORT_THRESHOLD = 3;
export const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/** 서버-사이드 검증 / 시드용 기본 태그 목록 — UI 태그는 /api/tags 에서 로드 */
export const FALLBACK_TAGS = ["연애", "진로", "가족", "친구", "건강", "일상", "기타"] as const;

export const BOTTLE_COLORS = [
  "초록", "청록", "파랑", "남색", "보라",
  "분홍", "빨강", "금", "은",
] as const;
export type BottleColor = (typeof BOTTLE_COLORS)[number];

export const PAPER_STYLES = [
  "기본", "낡은", "분홍", "파랑",
  "민트", "노랑", "라벤더", "연두", "복숭아", "회색",
] as const;
export type PaperStyle = (typeof PAPER_STYLES)[number];

// 병 색상별 RGB 기준값 (bottle-body 그라디언트 중심색)
export const BOTTLE_COLOR_MAP: Record<BottleColor, { r: number; g: number; b: number }> = {
  초록: { r: 130, g: 195, b: 178 },
  청록: { r: 80,  g: 200, b: 200 },
  파랑: { r: 100, g: 155, b: 225 },
  남색: { r: 80,  g: 110, b: 200 },
  보라: { r: 155, g: 120, b: 215 },
  분홍: { r: 220, g: 135, b: 170 },
  빨강: { r: 210, g: 90,  b: 90  },
  금:   { r: 210, g: 175, b: 60  },
  은:   { r: 180, g: 185, b: 200 },
};

// 편지지 스타일별 색상 (MessageCard 배경, 병 속 종이)
export const PAPER_STYLE_MAP: Record<PaperStyle, { bg: string; note: string; label: string }> = {
  기본:   { bg: "rgba(245,235,210,0.85)", note: "#faf5e8", label: "크림"  },
  낡은:   { bg: "rgba(210,185,145,0.85)", note: "#e8d8b0", label: "앤틱"  },
  분홍:   { bg: "rgba(245,215,225,0.85)", note: "#fde8f0", label: "분홍"  },
  파랑:   { bg: "rgba(210,230,245,0.85)", note: "#e4f0fb", label: "하늘"  },
  민트:   { bg: "rgba(200,240,228,0.85)", note: "#e0f8ee", label: "민트"  },
  노랑:   { bg: "rgba(255,248,185,0.85)", note: "#fffae0", label: "노랑"  },
  라벤더: { bg: "rgba(228,218,248,0.85)", note: "#f0eafd", label: "라벤더"},
  연두:   { bg: "rgba(215,242,195,0.85)", note: "#e8f5d8", label: "연두"  },
  복숭아: { bg: "rgba(255,222,202,0.85)", note: "#ffe8d8", label: "복숭아"},
  회색:   { bg: "rgba(225,225,232,0.85)", note: "#f2f2f5", label: "회색"  },
};
