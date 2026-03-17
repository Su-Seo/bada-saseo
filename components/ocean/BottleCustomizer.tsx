"use client";

import { motion } from "framer-motion";
import {
  TAGS,
  BOTTLE_COLORS,
  PAPER_STYLES,
  BOTTLE_COLOR_MAP,
  PAPER_STYLE_MAP,
} from "@/lib/constants";
import type { ComposeOptions } from "@/lib/types";
import GlassBottle from "./GlassBottle";

interface Props {
  value: ComposeOptions;
  onChange: (updates: Partial<ComposeOptions>) => void;
  /** "md" = ThrowModal 전체 크기, "sm" = BeachBottle 인라인 카드 */
  size?: "sm" | "md";
}

export default function BottleCustomizer({ value, onChange, size = "md" }: Props) {
  const isSm = size === "sm";
  const bottlePreviewSize = isSm ? 2.0 : 3.2;
  const labelCls = isSm ? "text-[0.5rem]" : "text-[0.6rem]";
  const dotCls   = isSm ? "w-3.5 h-3.5" : "w-5 h-5";
  const tagPx    = isSm ? "px-1.5" : "px-2";
  const tagTxt   = isSm ? "text-[0.5rem]" : "text-[0.6rem]";

  return (
    <div className={`flex ${isSm ? "gap-2" : "gap-3"} items-start`}>
      {/* ── 병 미리보기 ── */}
      <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
        <motion.div
          key={value.bottleColor + value.paperStyle}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <GlassBottle
            size={bottlePreviewSize}
            hasNote
            bottleColor={value.bottleColor}
            paperStyle={value.paperStyle}
          />
        </motion.div>
        <span className="text-[0.45rem] text-white/25 tracking-wide text-center">
          {value.bottleColor} · {PAPER_STYLE_MAP[value.paperStyle].label}
        </span>
      </div>

      {/* ── 선택 옵션 ── */}
      <div className="flex-1 flex flex-col gap-2">
        {/* 태그 */}
        <div>
          <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>태그</p>
          <div className="flex flex-wrap gap-1">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ tag: value.tag === t ? null : t })}
                className={`${tagPx} py-0.5 rounded-full ${tagTxt} transition-all border ${
                  value.tag === t
                    ? "bg-white/25 border-white/50 text-white"
                    : "bg-white/5 border-white/15 text-white/40 hover:bg-white/15"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 병 색상 */}
        <div>
          <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>병 색상</p>
          <div className="flex flex-wrap gap-1.5">
            {BOTTLE_COLORS.map((c) => {
              const { r, g, b } = BOTTLE_COLOR_MAP[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ bottleColor: c })}
                  title={c}
                  className={`${dotCls} rounded-full transition-all border-2 ${
                    value.bottleColor === c ? "border-white/80 scale-125" : "border-white/20"
                  }`}
                  style={{ background: `rgba(${r},${g},${b},0.85)` }}
                />
              );
            })}
          </div>
        </div>

        {/* 편지지 */}
        <div>
          <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>편지지</p>
          <div className="flex gap-1.5">
            {PAPER_STYLES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ paperStyle: p })}
                title={PAPER_STYLE_MAP[p].label}
                className="flex flex-col items-center gap-0.5 transition-all"
              >
                <span
                  className={`${dotCls} rounded border-2 block ${
                    value.paperStyle === p ? "border-white/80 scale-125" : "border-white/20"
                  }`}
                  style={{ background: PAPER_STYLE_MAP[p].note }}
                />
                {!isSm && (
                  <span className="text-[0.45rem] text-white/30">
                    {PAPER_STYLE_MAP[p].label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
