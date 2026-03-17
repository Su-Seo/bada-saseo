"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  BOTTLE_COLORS,
  PAPER_STYLES,
  BOTTLE_COLOR_MAP,
  PAPER_STYLE_MAP,
} from "@/lib/constants";
import type { ComposeOptions } from "@/lib/types";
import GlassBottle from "./GlassBottle";
import { useTags } from "./hooks/useTags";

interface Props {
  value: ComposeOptions;
  onChange: (updates: Partial<ComposeOptions>) => void;
  /** "md" = ThrowModal 전체 크기, "sm" = BeachBottle 인라인 카드 */
  size?: "sm" | "md";
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function BottleCustomizer({ value, onChange, size = "md" }: Props) {
  const isSm = size === "sm";
  const { tags, loading: tagsLoading } = useTags();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const bottlePreviewSize = isSm ? 2.5 : 4.0;
  const labelCls  = isSm ? "text-[0.5rem]" : "text-[0.6rem]";
  const dotCls    = isSm ? "w-3.5 h-3.5" : "w-5 h-5";
  const tagPx     = isSm ? "px-1.5" : "px-2";
  const tagTxt    = isSm ? "text-[0.5rem]" : "text-[0.6rem]";

  const isCustomColor = HEX_RE.test(value.bottleColor as string);

  // 현재 선택된 병 색상 프리뷰용 CSS 색상
  function bottleSwatchColor(c: string): string {
    const preset = BOTTLE_COLOR_MAP[c as keyof typeof BOTTLE_COLOR_MAP];
    if (preset) return `rgba(${preset.r},${preset.g},${preset.b},0.85)`;
    if (HEX_RE.test(c)) return c;
    return "transparent";
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── 병 미리보기(왼쪽) + 색상·편지지(오른쪽) ── */}
      <div className={`flex ${isSm ? "gap-3" : "gap-5"} items-start`}>
        {/* 병 미리보기 */}
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
        </div>

        {/* 병 색상 + 편지지 */}
        <div className="flex-1 flex flex-col gap-2">
          {/* 병 색상 */}
          <div>
            <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>병 색상</p>
            <div className="flex flex-wrap gap-1.5">
              {BOTTLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ bottleColor: c })}
                  title={c}
                  className={`${dotCls} rounded-full transition-all border-2 ${
                    value.bottleColor === c ? "border-white/80 scale-125" : "border-white/20"
                  }`}
                  style={{ background: bottleSwatchColor(c) }}
                />
              ))}

              {/* 커스텀 색상 피커 (맨 마지막) */}
              <label
                title="직접 색상 선택"
                className={`${dotCls} rounded-full transition-all border-2 cursor-pointer flex items-center justify-center overflow-hidden relative ${
                  isCustomColor ? "border-white/80 scale-125" : "border-white/20"
                }`}
                style={
                  isCustomColor
                    ? { background: value.bottleColor as string }
                    : {
                        background:
                          "conic-gradient(from 0deg, #ff4444, #ffaa00, #44ff44, #00aaff, #aa44ff, #ff4444)",
                      }
                }
              >
                {!isCustomColor && (
                  <span className="text-white/80 font-bold leading-none" style={{ fontSize: "0.55rem" }}>
                    +
                  </span>
                )}
                <input
                  ref={colorInputRef}
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={isCustomColor ? (value.bottleColor as string) : "#7cb9b0"}
                  onChange={(e) => onChange({ bottleColor: e.target.value })}
                />
              </label>
            </div>
          </div>

          {/* 편지지 */}
          <div>
            <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>편지지</p>
            <div className="flex flex-wrap gap-1.5">
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
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 태그 (맨 위) ── */}
      <div>
        <p className={`${labelCls} text-white/25 mb-1 tracking-wider`}>태그</p>
        {tagsLoading ? (
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-8 rounded-full bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
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
        )}
      </div>
    </div>
  );
}
