"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FloatingBottle, { BottleData } from "./FloatingBottle";
import BeachBottle from "./BeachBottle";
import ThrowModal from "./ThrowModal";
import PickModal from "./PickModal";
import GlassBottle from "./GlassBottle";
import {
  OceanTheme,
  DARK_THEME,
  LIGHT_THEME,
  getThemeForHour,
  buildGradient,
  getWaveColors,
  getWashBackground,
  getMoonlightColor,
} from "@/lib/oceanTheme";

// ── 씬 비율 상수 ──────────────────────────────────────
const HORIZON_PCT = 0.37;
const SHORE_PCT = 0.67;
const BEACH_PCT = 0.7;
const MAX_BOTTLES = 6;
const MAX_BEACH_BOTTLES = 5;
const BEACH_SPAWN_MS = 10_000;

// ── 유틸 ──────────────────────────────────────────────
function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createBottle(messageId: string): BottleData {
  return {
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    messageId,
    x: rand(10, 84),
    xDrift: rand(-45, 45),
    duration: rand(20, 30),
  };
}

// ── 해변 병 타입 ──────────────────────────────────────
interface BeachBottleItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

function createBeachBottle(): BeachBottleItem {
  return {
    id: `bb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    x: rand(6, 86),
    y: rand(3, 19),
    rotation: rand(-35, 12),
  };
}

// ── 별 타입 ───────────────────────────────────────────
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

// ── 테마 모드 ─────────────────────────────────────────
export const THEME_MODE = {
  DARK: "dark",
  LIGHT: "light",
  AUTO: "auto",
} as const;

export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

function getCurrentHour(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

function getTheme(mode: ThemeMode, hour: number): OceanTheme {
  switch (mode) {
    case THEME_MODE.DARK:
      return DARK_THEME;
    case THEME_MODE.LIGHT:
      return LIGHT_THEME;
    case THEME_MODE.AUTO:
      return getThemeForHour(hour);
  }
}

// 태양 위치 계산 (일출 5:30 ~ 일몰 19:30 호 운동)
function getSunPosition(
  mode: ThemeMode,
  hour: number
): { x: number; y: number } | null {
  if (mode === THEME_MODE.DARK) return null;
  const h = mode === THEME_MODE.LIGHT ? 12 : hour;
  const rise = 5.5;
  const set = 19.5;
  if (h < rise || h > set) return null;
  const progress = (h - rise) / (set - rise); // 0 → 1
  const x = 8 + progress * 84; // 8% (동쪽) → 92% (서쪽)
  const horizonY = HORIZON_PCT * 100 - 1;
  const peakY = 6;
  const sinVal = Math.sin(progress * Math.PI);
  const y = horizonY - sinVal * (horizonY - peakY);
  return { x, y };
}

// ── 메인 컴포넌트 ─────────────────────────────────────
export default function OceanScene() {
  const [viewH, setViewH] = useState(800);
  const [bottles, setBottles] = useState<BottleData[]>([]);
  const queueRef = useRef<string[]>([]);
  const [beachBottles, setBeachBottles] = useState<BeachBottleItem[]>([]);
  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);

  // ── 테마 ──────────────────────────────────────────
  const [themeMode, setThemeMode] = useState<ThemeMode>(THEME_MODE.DARK);
  // SSR 타임존 불일치 방지: 클라이언트 마운트 후 브라우저 로컬 시간으로 초기화
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    setCurrentHour(getCurrentHour());
  }, []);

  useEffect(() => {
    if (themeMode !== THEME_MODE.AUTO) return;
    setCurrentHour(getCurrentHour());
    const timer = setInterval(() => setCurrentHour(getCurrentHour()), 60_000);
    return () => clearInterval(timer);
  }, [themeMode]);

  const theme = getTheme(themeMode, currentHour);
  const gradient = buildGradient(theme, HORIZON_PCT, SHORE_PCT, BEACH_PCT);
  const waveColors = getWaveColors(theme);
  const sunPos = theme.sunOpacity > 0.01 ? getSunPosition(themeMode, currentHour) : null;

  // ── 별 (클라이언트에서만 생성 → hydration mismatch 방지) ──
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    setStars(
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * (HORIZON_PCT * 100 - 2),
        size: 0.5 + Math.random() * 2.2,
        duration: 2 + Math.random() * 5,
        delay: Math.random() * 6,
      }))
    );
  }, []);

  // ── 뷰포트 높이 측정 ──────────────────────────────
  useEffect(() => {
    const update = () => setViewH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const horizonY = viewH * HORIZON_PCT;
  const shoreY = viewH * SHORE_PCT;

  // ── 바다 병 추가 / 제거 ────────────────────────────
  const addBottle = useCallback((messageId: string) => {
    setBottles((prev) => {
      if (prev.length >= MAX_BOTTLES) {
        queueRef.current.push(messageId);
        return prev;
      }
      return [...prev, createBottle(messageId)];
    });
  }, []);

  const removeBottle = useCallback((bottleId: string) => {
    setBottles((prev) => {
      const next = prev.filter((b) => b.id !== bottleId);
      if (next.length < MAX_BOTTLES && queueRef.current.length > 0) {
        const queued = queueRef.current.shift()!;
        return [...next, createBottle(queued)];
      }
      return next;
    });
  }, []);

  // ── SSE 연결 ──────────────────────────────────────
  useEffect(() => {
    let es: EventSource | null = null;
    let since = new Date().toISOString();
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let mounted = true;

    const connect = () => {
      if (!mounted) return;
      es = new EventSource(`/api/sse?since=${encodeURIComponent(since)}`);

      es.onmessage = (e) => {
        const data = JSON.parse(e.data) as {
          type: string;
          messageId?: string;
          createdAt?: string;
          since?: string;
        };

        if (data.type === "bottle" && data.messageId) {
          if (data.createdAt) since = data.createdAt;
          addBottle(data.messageId);
        }

        if (data.type === "reconnect") {
          if (data.since) since = data.since;
          es?.close();
          reconnectTimer = setTimeout(connect, 150);
        }
      };

      es.onerror = () => {
        es?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      mounted = false;
      es?.close();
      clearTimeout(reconnectTimer);
    };
  }, [addBottle]);

  // ── 앰비언트 병 ────────────────────────────────────
  useEffect(() => {
    fetch("/api/messages/ambient")
      .then((r) => r.json())
      .then((data: { messages?: { id: string }[] }) => {
        if (!data.messages) return;
        data.messages.slice(0, 4).forEach((msg, i) => {
          setTimeout(() => addBottle(msg.id), i * 2200);
        });
      })
      .catch(() => {});
  }, [addBottle]);

  // ── 해변 병 초기 스폰 + 주기적 스폰 ─────────────────
  useEffect(() => {
    const initial = Array.from({ length: 3 }, () => createBeachBottle());
    setBeachBottles(initial);

    const timer = setInterval(() => {
      setBeachBottles((prev) => {
        if (prev.length >= MAX_BEACH_BOTTLES) return prev;
        return [...prev, createBeachBottle()];
      });
    }, BEACH_SPAWN_MS);

    return () => clearInterval(timer);
  }, []);

  // ── 해변 병 던지기 (API 호출) ────────────────────────
  const handleBeachThrow = useCallback((_bottleId: string, content: string) => {
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).catch(() => {});
  }, []);

  const handleBeachRemove = useCallback((bottleId: string) => {
    setBeachBottles((prev) => prev.filter((b) => b.id !== bottleId));
  }, []);

  // ── 바다 병 클릭 → 픽 모달 ────────────────────────
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
      {/* ────────────────────────────────────────────
          레이어 1: 하늘 + 바다 + 해변 그라디언트
      ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-[background] duration-[3000ms]"
        style={{ background: gradient }}
      />

      {/* ────────────────────────────────────────────
          레이어 2: 별
      ──────────────────────────────────────────── */}
      {theme.starOpacity > 0.01 &&
        stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: theme.starOpacity,
              ["--twinkle-duration" as string]: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              transition: "opacity 3s ease",
            }}
          />
        ))}

      {/* ────────────────────────────────────────────
          레이어 3: 달
      ──────────────────────────────────────────── */}
      {theme.moonOpacity > 0.01 && (
        <>
          {/* 달빛 후광 */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              right: "9%",
              top: "4%",
              width: 180,
              height: 180,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle, rgba(200,210,240,0.06) 0%, transparent 70%)",
              transition: "opacity 3s ease",
            }}
          />
          {/* 달 */}
          <div
            className="absolute rounded-full"
            style={{
              right: "13%",
              top: "8%",
              width: 38,
              height: 38,
              opacity: theme.moonOpacity,
              background:
                "radial-gradient(circle at 35% 35%, #e8e4d8, #d4cfc0 50%, #bab5a5 80%, #a09a88)",
              boxShadow:
                "0 0 12px rgba(220,215,195,0.35), 0 0 40px rgba(200,195,175,0.1)",
              transition: "opacity 3s ease",
            }}
          />
        </>
      )}

      {/* ────────────────────────────────────────────
          레이어 3b: 태양
      ──────────────────────────────────────────── */}
      {sunPos && (
        <>
          {/* 태양 후광 */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 220,
              height: 220,
              opacity: theme.sunOpacity * 0.35,
              background:
                "radial-gradient(circle, rgba(255,240,160,0.5) 0%, rgba(255,210,80,0.2) 35%, transparent 70%)",
              transition: "opacity 3s ease, left 3s ease, top 3s ease",
            }}
          />
          {/* 태양 디스크 */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${sunPos.x}%`,
              top: `${sunPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: 46,
              height: 46,
              opacity: theme.sunOpacity,
              background:
                "radial-gradient(circle at 42% 38%, #fffde8, #ffe966 40%, #ffd020 70%, #ffb800)",
              boxShadow:
                "0 0 18px rgba(255,220,60,0.7), 0 0 55px rgba(255,190,40,0.3)",
              transition: "opacity 3s ease, left 3s ease, top 3s ease",
            }}
          />
        </>
      )}

      {/* ────────────────────────────────────────────
          레이어 4: 바다 위 달빛 반사
      ──────────────────────────────────────────── */}
      {theme.moonOpacity > 0.01 && (
        <div
          className="absolute pointer-events-none"
          style={{
            right: "8%",
            top: `${HORIZON_PCT * 100 + 1}%`,
            width: "12%",
            height: "28%",
            background: getMoonlightColor(theme),
            filter: "blur(8px)",
            transition: "opacity 3s ease",
          }}
        />
      )}

      {/* ────────────────────────────────────────────
          레이어 5: 수평선 발광
      ──────────────────────────────────────────── */}
      <div
        className="absolute w-full pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 4}%`,
          height: "8%",
          opacity: theme.horizonGlowOpacity,
          background:
            "radial-gradient(ellipse 130% 100% at 50% 80%, rgba(40,70,120,0.1) 0%, transparent 65%)",
          transition: "opacity 3s ease",
        }}
      />
      <div
        className="absolute w-full horizon-glow pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 0.3}%`,
          height: "0.8%",
          opacity: theme.horizonGlowOpacity,
          background:
            "linear-gradient(180deg, transparent 10%, rgba(60,100,160,0.1) 50%, transparent 90%)",
          transition: "opacity 3s ease",
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 5a: 바다 표면 파도결
      ──────────────────────────────────────────── */}
      <div
        className="absolute w-full pointer-events-none overflow-hidden"
        style={{
          top: `${HORIZON_PCT * 100 + 2}%`,
          height: `${(SHORE_PCT - HORIZON_PCT) * 100 - 4}%`,
          zIndex: 4,
        }}
      >
        {/* 낮에는 multiply 블렌드로 밝은 바다에서도 파도결이 보이게 */}
        <div
          className="ocean-ripple-layer ocean-ripple-1"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
        <div
          className="ocean-ripple-layer ocean-ripple-2"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
        <div
          className="ocean-ripple-layer ocean-ripple-3"
          style={{ mixBlendMode: theme.sunOpacity > 0.5 ? "multiply" : "normal" }}
        />
      </div>

      {/* ────────────────────────────────────────────
          레이어 5b: 바다 표면 빛 반짝임
      ──────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none ocean-shimmer"
        style={{
          top: `${HORIZON_PCT * 100 + 5}%`,
          left: "5%",
          width: "90%",
          height: `${(SHORE_PCT - HORIZON_PCT) * 100 - 8}%`,
          zIndex: 5,
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 5c: 표류 중인 유리병들 (바다)
      ──────────────────────────────────────────── */}
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

      {/* ────────────────────────────────────────────
          레이어 6: 해안 파도 (멀티 레이어)
      ──────────────────────────────────────────── */}
      {/* 먼 파도 */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 6}%`, height: "5%", zIndex: 19 }}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-far"
          fill={waveColors.farFill}
          d="M0,30 C180,22 360,38 540,30 C720,22 900,38 1080,30 C1260,22 1440,30 1440,30 L1440,60 L0,60 Z"
        />
      </svg>

      {/* 중간 파도 */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 3.8}%`, height: "6%", zIndex: 21 }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-back"
          fill={waveColors.backFill}
          d="M0,35 C360,50 720,20 1080,35 C1260,43 1380,28 1440,35 L1440,80 L0,80 Z"
        />
        <path
          className="animate-shore-wave-front"
          fill={waveColors.frontFill}
          d="M0,50 C240,38 480,62 720,50 C960,38 1200,62 1440,50 L1440,80 L0,80 Z"
        />
      </svg>

      {/* 가장 앞 파도 + 포말 */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{ top: `${SHORE_PCT * 100 - 1.5}%`, height: "4.5%", zIndex: 23 }}
        viewBox="0 0 1440 50"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-near"
          fill={waveColors.nearFill}
          d="M0,18 C120,12 240,24 360,18 C480,12 600,24 720,18 C840,12 960,24 1080,18 C1200,12 1320,24 1440,18 L1440,50 L0,50 Z"
        />
        <path
          className="animate-shore-wave-near"
          fill={waveColors.foamFill}
          d="M0,16 C120,10 240,22 360,16 C480,10 600,22 720,16 C840,10 960,22 1080,16 C1200,10 1320,22 1440,16 L1440,20 L0,20 Z"
        />
      </svg>

      {/* ────────────────────────────────────────────
          레이어 6b: 파도 치기 (밀려왔다 빠지기)
      ──────────────────────────────────────────── */}
      <div
        className="absolute w-full pointer-events-none overflow-hidden"
        style={{ top: `${BEACH_PCT * 100 - 3}%`, height: "10%", zIndex: 25 }}
      >
        <div className="wave-wash wave-wash-1" style={{ background: getWashBackground(theme, 1) }} />
        <div className="wave-wash wave-wash-2" style={{ background: getWashBackground(theme, 2) }} />
        <div className="wave-wash wave-wash-3" style={{ background: getWashBackground(theme, 3) }} />
      </div>

      {/* ────────────────────────────────────────────
          레이어 6c: 젖은 모래 (바다-모래 전환 구간)
      ──────────────────────────────────────────── */}
      <div
        className="absolute w-full pointer-events-none"
        style={{
          top: `${BEACH_PCT * 100}%`,
          height: "5%",
          zIndex: 3,
          background: `linear-gradient(180deg,
            rgba(${theme.wetSand[0]},${theme.wetSand[1]},${theme.wetSand[2]},0.9) 0%,
            rgba(${theme.sandLight[0]},${theme.sandLight[1]},${theme.sandLight[2]},0.6) 40%,
            transparent 100%
          )`,
        }}
      />
      {/* 젖은 모래 광택 */}
      <div
        className="absolute w-full pointer-events-none wet-sand-sheen"
        style={{ top: `${BEACH_PCT * 100}%`, height: "3%", zIndex: 4 }}
      />

      {/* ────────────────────────────────────────────
          레이어 6d: 모래 텍스처
      ──────────────────────────────────────────── */}
      <div
        className="absolute w-full pointer-events-none sand-grain"
        style={{ top: `${BEACH_PCT * 100}%`, bottom: 0, zIndex: 2 }}
      />

      {/* ────────────────────────────────────────────
          레이어 6e: 조개 & 자갈
      ──────────────────────────────────────────── */}
      {[
        { x: 9,  yOff: 1.8, type: "fan",    rot: -22, s: 1.0 },
        { x: 21, yOff: 4.5, type: "oval",   rot:  18, s: 0.75 },
        { x: 36, yOff: 2.2, type: "fan",    rot:   8, s: 0.85 },
        { x: 49, yOff: 5.8, type: "pebble", rot:   0, s: 1.0 },
        { x: 61, yOff: 1.5, type: "oval",   rot: -30, s: 0.9 },
        { x: 74, yOff: 3.8, type: "fan",    rot:  25, s: 0.8 },
        { x: 85, yOff: 2.0, type: "pebble", rot:   0, s: 1.1 },
        { x: 93, yOff: 4.2, type: "oval",   rot: -12, s: 0.7 },
      ].map((sh) => (
        <div
          key={`sh-${sh.x}`}
          className="absolute pointer-events-none"
          style={{
            left: `${sh.x}%`,
            top: `${BEACH_PCT * 100 + sh.yOff}%`,
            zIndex: 3,
            opacity: Math.min(1, (theme.sandLight[0] / 190) * 0.85),
            transition: "opacity 3s ease",
          }}
        >
          <svg
            width="18" height="18" viewBox="-9 -9 18 18"
            style={{ transform: `rotate(${sh.rot}deg) scale(${sh.s})`, display: "block" }}
          >
            {sh.type === "fan" && (
              <g>
                <path
                  d="M-5.5,5 C-7,-1 -3,-9 0,-9 C3,-9 7,-1 5.5,5 Z"
                  fill="rgba(238,218,188,0.78)"
                  stroke="rgba(195,162,118,0.55)"
                  strokeWidth="0.6"
                />
                <line x1="0" y1="5" x2="-4" y2="-5.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
                <line x1="0" y1="5" x2="0"  y2="-8.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
                <line x1="0" y1="5" x2="4"  y2="-5.5" stroke="rgba(185,152,108,0.45)" strokeWidth="0.7"/>
              </g>
            )}
            {sh.type === "oval" && (
              <ellipse
                cx="0" cy="0" rx="4" ry="7"
                fill="rgba(230,202,168,0.72)"
                stroke="rgba(190,158,118,0.5)"
                strokeWidth="0.6"
              />
            )}
            {sh.type === "pebble" && (
              <ellipse
                cx="0" cy="0" rx="5.5" ry="4"
                fill="rgba(195,182,162,0.65)"
                stroke="rgba(165,152,132,0.4)"
                strokeWidth="0.5"
              />
            )}
          </svg>
        </div>
      ))}

      {/* ────────────────────────────────────────────
          레이어 7: 해변 유리병들
      ──────────────────────────────────────────── */}
      <AnimatePresence>
        {beachBottles.map((bb) => (
          <BeachBottle
            key={bb.id}
            id={bb.id}
            x={bb.x}
            y={bb.y}
            rotation={bb.rotation}
            shoreY={shoreY}
            horizonY={horizonY}
            onThrow={handleBeachThrow}
            onRemove={handleBeachRemove}
          />
        ))}
      </AnimatePresence>

      {/* ────────────────────────────────────────────
          사이드 던지기 버튼
      ──────────────────────────────────────────── */}
      <button
        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15 text-white/60 hover:bg-white/15 hover:text-white/90 transition-all active:scale-95"
        onClick={() => setThrowOpen(true)}
        aria-label="고민 던지기"
        title="고민 던지기"
      >
        <GlassBottle size={1.4} />
        <span
          className="text-white/50 tracking-wider"
          style={{ fontSize: "0.55rem", writingMode: "vertical-rl" }}
        >
          던지기
        </span>
      </button>

      {/* ────────────────────────────────────────────
          타이틀 (좌상단)
      ──────────────────────────────────────────── */}
      <div className="absolute top-5 left-5 z-40 pointer-events-none">
        <h1
          className="text-white/40 font-light tracking-[0.45em]"
          style={{ fontSize: "0.75rem" }}
        >
          바다사서
        </h1>
      </div>

      {/* ────────────────────────────────────────────
          테마 토글 (좌상단 타이틀 아래)
      ──────────────────────────────────────────── */}
      <div className="fixed top-12 left-5 z-40 flex items-center gap-1">
        {([THEME_MODE.AUTO, THEME_MODE.DARK, THEME_MODE.LIGHT] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setThemeMode(mode)}
            className={`p-1.5 rounded-lg transition-all ${
              themeMode === mode
                ? "bg-white/20 text-white/90"
                : "text-white/30 hover:text-white/60 hover:bg-white/8"
            }`}
            aria-label={
              mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"
            }
            title={
              mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"
            }
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

      {/* ────────────────────────────────────────────
          빈 바다 안내
      ──────────────────────────────────────────── */}
      <AnimatePresence>
        {bottles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 4, duration: 2 }}
            className="absolute z-20 text-center pointer-events-none"
            style={{
              top: "52%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <p
              className="text-white/20 tracking-widest"
              style={{ fontSize: "0.7rem" }}
            >
              아직 바다가 고요해요...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────────────────
          모달
      ──────────────────────────────────────────── */}
      <AnimatePresence>
        {throwOpen && (
          <ThrowModal key="throw" onClose={() => setThrowOpen(false)} />
        )}
        {pickMessageId && (
          <PickModal
            key="pick"
            messageId={pickMessageId}
            onClose={() => setPickMessageId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
