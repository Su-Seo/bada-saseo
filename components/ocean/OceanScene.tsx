"use client";

import { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import FloatingBottle from "./FloatingBottle";
import OceanSky from "./OceanSky";
import OceanWaves from "./OceanWaves";
import OceanBeach from "./OceanBeach";
import { useOceanTheme } from "./hooks/useOceanTheme";
import { useViewport } from "./hooks/useViewport";
import { useStars } from "./hooks/useStars";
import { useOceanBottles } from "./hooks/useOceanBottles";
import { useBeachBottles } from "./hooks/useBeachBottles";
import { useBagCounts } from "./hooks/useBagCounts";
import { useOceanUI } from "./hooks/useOceanUI";
import OceanUI from "./OceanUI";
import { OceanBottlesProvider } from "./OceanBottlesContext";

export default function OceanScene() {
  const { themeMode, setThemeMode, currentHour, adjustedHour, setAdjustedHour, animatedHour, theme, gradient, waveColors, sunPos, moonPos } = useOceanTheme();
  const { viewH, horizonY, shoreY } = useViewport();
  const stars = useStars();
  const { bottles, removeBottle, addMyBottle, todayCount, pendingCount } = useOceanBottles();
  const floatingMessageIds = new Set(bottles.map((b) => b.messageId));
  const { unhearted, hearted, refresh: refreshBagCounts } = useBagCounts();
  const { beachBottles, handleBeachRemove } = useBeachBottles();
  const {
    throwOpen, openThrow, closeThrow,
    pickMessageId, openPick, closePick,
    statsOpen, openStats, closeStats,
    todayBagOpen, openTodayBag, closeTodayBag,
  } = useOceanUI();

  const isDaytime = theme.sunOpacity > 0.5;

  const handleBottleClick = useCallback(
    ({ messageId, bottleId }: { messageId: string; bottleId: string }) => {
      removeBottle(bottleId);
      openPick(messageId);
    },
    [removeBottle, openPick]
  );

  return (
    <OceanBottlesProvider value={{ addMyBottle }}>
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ background: `rgb(${theme.skyTop.join(",")})` }}
      >
        {/* 레이어 1: 그라디언트 배경 (CSS transition 제거 — JS RAF로 직접 애니메이션) */}
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
        />

        {/* 레이어 2-5: 하늘 (별, 달, 태양, 수평선 발광) */}
        <OceanSky theme={theme} stars={stars} sunPos={sunPos} moonPos={moonPos} />

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
              onExpire={(id) => { removeBottle(id); refreshBagCounts(pendingCount - 1); }}
            />
          ))}
        </AnimatePresence>

        {/* 레이어 6c-7: 해변 (모래, 조개, 해변 병) */}
        <OceanBeach
          theme={theme}
          beachBottles={beachBottles}
          shoreY={shoreY}
          horizonY={horizonY}
          onBeachRemove={handleBeachRemove}
          isDaytime={isDaytime}
          viewH={viewH}
          unhearted={unhearted}
          hearted={hearted}
          onTodayBagOpen={openTodayBag}
        />

        {/* UI 오버레이 */}
        <OceanUI
          isDaytime={isDaytime}
          bottlesEmpty={bottles.length === 0}
          todayCount={todayCount}
          pendingCount={pendingCount}
          refreshBagCounts={refreshBagCounts}
          themeToggleProps={{ themeMode, setThemeMode, isDaytime, currentHour, adjustedHour, setAdjustedHour, animatedHour }}
          throwOpen={throwOpen}
          onThrowOpen={openThrow}
          onThrowClose={closeThrow}
          pickMessageId={pickMessageId}
          onPickClose={closePick}
          onPickMessage={openPick}
          statsOpen={statsOpen}
          onStatsOpen={openStats}
          onStatsClose={closeStats}
          todayBagOpen={todayBagOpen}
          onTodayBagClose={closeTodayBag}
          floatingMessageIds={floatingMessageIds}
        />
      </div>
    </OceanBottlesProvider>
  );
}
