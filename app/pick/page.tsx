"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OceanBackground from "@/components/animations/OceanBackground";
import BottlePick from "@/components/animations/BottlePick";
import MessageCard from "@/components/ui/MessageCard";
import { TAGS, Tag } from "@/lib/constants";

type Stage = "idle" | "floating" | "open" | "empty";

interface Message {
  id: string;
  content: string;
  tag?: string | null;
  bottleColor?: string | null;
  paperStyle?: string | null;
  heartCount: number;
}

export default function PickPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const handlePickBottle = async () => {
    const url = selectedTag
      ? `/api/messages/random?tag=${encodeURIComponent(selectedTag)}`
      : "/api/messages/random";
    const res = await fetch(url);
    const data = await res.json();

    if (!data.message) {
      setStage("empty");
      return;
    }

    setMessage(data.message);
    setStage("floating");
  };

  const handleBottleClick = () => {
    setStage("open");
  };

  const handleClose = () => {
    setMessage(null);
    setStage("idle");
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      <OceanBackground />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <div>
                <h1 className="text-lg font-light tracking-widest text-white/80">
                  유리병 줍기
                </h1>
                <p className="text-xs text-white/40 mt-1">
                  바다에서 떠내려온 누군가의 마음
                </p>
              </div>

              {/* 태그 필터 */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all border ${
                      selectedTag === t
                        ? "bg-white/30 border-white/50 text-white"
                        : "bg-white/5 border-white/15 text-white/40 hover:bg-white/15 hover:text-white/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePickBottle}
                className="w-full py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm tracking-widest hover:bg-white/25 transition-all active:scale-95"
              >
                {selectedTag ? `#${selectedTag} 편지 줍기 🍾` : "유리병 줍기 🍾"}
              </button>

              <button
                onClick={() => router.push("/")}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← 돌아가기
              </button>
            </motion.div>
          )}

          {stage === "floating" && (
            <motion.div
              key="floating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <p className="text-xs text-white/40 tracking-wider">
                유리병을 클릭해 열어보세요
              </p>
              <BottlePick stage={stage} onBottleClick={handleBottleClick} />
            </motion.div>
          )}

          {stage === "open" && message && (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MessageCard
                id={message.id}
                content={message.content}
                tag={message.tag}
                bottleColor={message.bottleColor}
                paperStyle={message.paperStyle}
                heartCount={message.heartCount}
                onClose={handleClose}
              />
            </motion.div>
          )}

          {stage === "empty" && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <p className="text-3xl">🌊</p>
              <p className="text-sm text-white/60">
                아직 바다에 편지가 없어요.
                <br />
                첫 번째로 마음을 던져보세요.
              </p>
              <button
                onClick={() => router.push("/throw")}
                className="mt-2 py-3 px-6 rounded-2xl bg-white/10 border border-white/15 text-sm text-white/70 hover:bg-white/20 transition-all"
              >
                고민 던지러 가기
              </button>
              <button
                onClick={() => setStage("idle")}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
