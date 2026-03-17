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
import { useOceanTheme, THEME_MODE } from "./hooks/useOceanTheme";
import { useViewport } from "./hooks/useViewport";
import { useStars } from "./hooks/useStars";
import { useOceanBottles } from "./hooks/useOceanBottles";
import { useBeachBottles } from "./hooks/useBeachBottles";
import SoundToggle from "@/components/SoundToggle";

export default function OceanScene() {
  const { themeMode, setThemeMode, theme, gradient, waveColors, sunPos } = useOceanTheme();
  const { horizonY, shoreY } = useViewport();
  const stars = useStars();
  const { bottles, removeBottle, todayCount } = useOceanBottles();
  const { beachBottles, handleBeachThrow, handleBeachRemove } = useBeachBottles();

  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);

  const isDaytime = theme.sunOpacity > 0.5;
  // 낮/밤 텍스트 색상 — 낮은 밝은 배경이라 opacity를 높여서 가시성 확보
  const txt = {
    faint:  isDaytime ? "text-white/70"  : "text-white/25",
    dim:    isDaytime ? "text-white/80"  : "text-white/40",
    mid:    isDaytime ? "text-white/90"  : "text-white/60",
    bright: isDaytime ? "text-white"     : "text-white/90",
    btn:    isDaytime ? "text-white/70 hover:text-white" : "text-white/30 hover:text-white/60",
    btnActive: isDaytime ? "bg-black/20 text-white" : "bg-white/20 text-white/90",
    btnBase:   isDaytime ? "hover:bg-black/10 hover:bg-black/15" : "hover:text-white/60 hover:bg-white/8",
  };

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
      <OceanWaves theme={theme} waveColors={waveColors} />

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
        <div className="flex items-center gap-1">
          {([THEME_MODE.AUTO, THEME_MODE.DARK, THEME_MODE.LIGHT] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`p-1.5 rounded-lg transition-all ${
                themeMode === mode
                  ? txt.btnActive
                  : txt.btn
              }`}
              aria-label={mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"}
              title={mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"}
            >
              {mode === THEME_MODE.DARK && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C13.92 3.04 13.46 3 12 3z"/>
                </svg>
              )}
              {mode === THEME_MODE.LIGHT && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
                </svg>
              )}
              {mode === THEME_MODE.AUTO && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
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
