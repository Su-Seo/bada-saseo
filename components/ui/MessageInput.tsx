"use client";

import { MAX_LENGTH } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ value, onChange, disabled }: Props) {
  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        placeholder="누구에게도 말 못한 마음을 적어보세요..."
        className="w-full h-48 resize-none rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 p-4 text-sm leading-relaxed focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
      />
      <span className="absolute bottom-3 right-4 text-xs text-white/40">
        {value.length} / {MAX_LENGTH}
      </span>
    </div>
  );
}
