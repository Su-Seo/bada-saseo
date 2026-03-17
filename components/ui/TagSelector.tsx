"use client";

interface Props {
  tags: string[];
  selected: string | null;
  onChange: (tag: string | null) => void;
  /** "sm" = BottleCustomizer 인라인, "md" = PickPage 전체 크기 */
  size?: "sm" | "md";
}

export default function TagSelector({ tags, selected, onChange, size = "md" }: Props) {
  const px = size === "sm" ? "px-1.5" : "px-2.5";
  const py = size === "sm" ? "py-0.5" : "py-1";
  const txt = size === "sm" ? "text-[0.5rem]" : "text-xs";

  return (
    <div className={`flex flex-wrap ${size === "md" ? "justify-center" : ""} gap-1.5`}>
      {tags.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(selected === t ? null : t)}
          className={`${px} ${py} rounded-full ${txt} transition-all border ${
            selected === t
              ? "bg-white/30 border-white/50 text-white"
              : "bg-white/5 border-white/15 text-white/40 hover:bg-white/15 hover:text-white/70"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
