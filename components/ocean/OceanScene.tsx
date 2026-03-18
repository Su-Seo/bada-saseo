"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FloatingBottle from "./FloatingBottle";
import ThrowModal from "./ThrowModal";
import PickModal from "./PickModal";
import GlassBottle from "./GlassBottle";
import OceanSky from "./OceanSky";
import OceanWaves from "./OceanWaves";
import OceanBeach from "./OceanBeach";
import { useOceanTheme } from "./hooks/useOceanTheme";
import { getTextClasses } from "@/lib/oceanTheme";
import { useViewport } from "./hooks/useViewport";
import { useStars } from "./hooks/useStars";
import { useOceanBottles } from "./hooks/useOceanBottles";
import { useBeachBottles } from "./hooks/useBeachBottles";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "./ThemeToggle";

export default function OceanScene() {
  const { themeMode, setThemeMode, theme, gradient, waveColors, sunPos } = useOceanTheme();
  const { horizonY, shoreY } = useViewport();
  const stars = useStars();
  const { bottles, removeBottle, todayCount } = useOceanBottles();
  const { beachBottles, handleBeachThrow, handleBeachRemove } = useBeachBottles();

  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);

  const isDaytime = theme.sunOpacity > 0.5;
  const txt = getTextClasses(isDaytime);

  const handleBottleClick = useCallback(
    ({ messageId, bottleId }: { messageId: string; bottleId: string }) => {
      removeBottle(bottleId);
      setPickMessageId(messageId);
    },
    [removeBottle]
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: `rgb(${theme.skyTop.join(",")})` }}
    >
      {/* 레이어 1: 그라디언트 배경 */}
      <div
        className="absolute inset-0 transition-[background] duration-[3000ms]"
        style={{ background: gradient }}
      />

      {/* 레이어 2-5: 하늘 (별, 달, 태양, 수평선 발광) */}
      <OceanSky theme={theme} stars={stars} sunPos={sunPos} />

      {/* 레이어 5a-6b: 바다 파도 */}
      <OceanWaves theme={theme} waveColors={waveColors} sunPos={sunPos} />

      {/* 레이어 5c: 표류 중인 유리병들 */}
      <AnimatePresence>
        {bottles.map((bottle) => (
          <FloatingBottle
            key={bottle.id}
            bottle={bottle}
            horizonY={horizonY}
            shoreY={shoreY}
            onClick={handleBottleClick}
            onExpire={removeBottle}
          />
        ))}
      </AnimatePresence>

      {/* 레이어 6c-7: 해변 (모래, 조개, 해변 병) */}
      <OceanBeach
        theme={theme}
        beachBottles={beachBottles}
        shoreY={shoreY}
        horizonY={horizonY}
        onBeachThrow={handleBeachThrow}
        onBeachRemove={handleBeachRemove}
      />

      {/* ── UI: 던지기 버튼 ── */}
      <button
        className={`fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-2xl backdrop-blur-sm border transition-all active:scale-95 ${
          isDaytime
            ? "bg-black/15 border-black/3 text-white/90 hover:bg-black/25"
            : "bg-white/8 border-white/15 text-white/60 hover:bg-white/15 hover:text-white/90"
        }`}
        onClick={() => setThrowOpen(true)}
        aria-label="고민 던지기"
        title="고민 던지기"
      >
        <GlassBottle size={1.4} />
        <span
          className={isDaytime ? "text-white/90 tracking-wider" : "text-white/50 tracking-wider"}
          style={{ fontSize: "0.55rem", writingMode: "vertical-rl" }}
        >
          던지기
        </span>
      </button>

      {/* ── UI: 타이틀 ── */}
      <div className="absolute top-5 left-5 z-40 pointer-events-none">
        <h1
          className={`font-light tracking-[0.45em] ${txt.dim}`}
          style={{ fontSize: "0.75rem" }}
        >
          바다사서
        </h1>
      </div>

      {/* ── UI: 우상단 설정 (테마 토글 + 소리) ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} isDaytime={isDaytime} />
        <SoundToggle isDaytime={isDaytime} />
      </div>

      {/* ── UI: 오늘 통계 ── */}
      {todayCount !== null && (
        <div
          className={`fixed bottom-5 right-5 z-40 pointer-events-none text-right px-2.5 py-1.5 rounded-xl transition-colors ${
            isDaytime ? "bg-black/25 backdrop-blur-sm" : ""
          }`}
        >
          <p className={`${txt.faint} tracking-wider`} style={{ fontSize: "0.65rem" }}>
            오늘 바다에 던져진 마음
          </p>
          <p
            className={`${txt.mid} font-light tabular-nums`}
            style={{ fontSize: "1.1rem", lineHeight: 1.2 }}
          >
            {todayCount.toLocaleString()}개
          </p>
        </div>
      )}

      {/* ── UI: 빈 바다 안내 ── */}
      <AnimatePresence>
        {bottles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 4, duration: 2 }}
            className={`absolute z-20 text-center pointer-events-none px-3 py-1.5 rounded-xl transition-colors`}
            style={{ top: "52%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <p className={`${txt.faint} tracking-widest`} style={{ fontSize: "0.7rem" }}>
              아직 바다가 고요해요...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 모달 ── */}
      <AnimatePresence>
        {throwOpen && <ThrowModal key="throw" onClose={() => setThrowOpen(false)} />}
        {pickMessageId && (
          <PickModal key="pick" messageId={pickMessageId} onClose={() => setPickMessageId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
