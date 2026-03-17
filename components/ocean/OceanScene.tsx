"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FloatingBottle, { BottleData } from "./FloatingBottle";
import BeachBottle from "./BeachBottle";
import ThrowModal from "./ThrowModal";
import PickModal from "./PickModal";

// ── 씬 비율 상수 ──────────────────────────────────────
const HORIZON_PCT = 0.37;
const SHORE_PCT = 0.67;
const BEACH_PCT = 0.70;
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

// ── 메인 컴포넌트 ─────────────────────────────────────
export default function OceanScene() {
  const [viewH, setViewH] = useState(800);
  const [bottles, setBottles] = useState<BottleData[]>([]);
  const queueRef = useRef<string[]>([]);
  const [beachBottles, setBeachBottles] = useState<BeachBottleItem[]>([]);
  const [throwOpen, setThrowOpen] = useState(false);
  const [pickMessageId, setPickMessageId] = useState<string | null>(null);

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
    // 초기 3개 (stagger)
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
      style={{ background: "#04080f" }}
    >
      {/* ────────────────────────────────────────────
          레이어 1: 하늘 + 바다 + 해변 그라디언트
      ──────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            #04080f 0%,
            #06101f 15%,
            #0a1a35 28%,
            #10284a ${HORIZON_PCT * 100 - 3}%,
            #16365c ${HORIZON_PCT * 100 - 1}%,
            #1c4470 ${HORIZON_PCT * 100}%,
            #153860 ${HORIZON_PCT * 100 + 3}%,
            #0d2c50 ${HORIZON_PCT * 100 + 10}%,
            #092240 ${HORIZON_PCT * 100 + 18}%,
            #071a33 ${SHORE_PCT * 100 - 8}%,
            #061528 ${SHORE_PCT * 100 - 2}%,
            #081c30 ${SHORE_PCT * 100}%,
            #0a1e2e ${BEACH_PCT * 100 - 0.5}%,
            #3d2e1a ${BEACH_PCT * 100 + 0.3}%,
            #4a3820 ${BEACH_PCT * 100 + 3}%,
            #5c4528 ${BEACH_PCT * 100 + 10}%,
            #6b5230 85%,
            #7a5e38 92%,
            #8a6b40 100%
          )`,
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 2: 별 (seeded random → 자연스러운 분산)
      ──────────────────────────────────────────── */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            ["--twinkle-duration" as string]: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* ────────────────────────────────────────────
          레이어 3: 달
      ──────────────────────────────────────────── */}
      {/* 달빛 후광 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          right: "9%",
          top: "4%",
          width: 180,
          height: 180,
          background:
            "radial-gradient(circle, rgba(200,210,240,0.06) 0%, transparent 70%)",
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
          background:
            "radial-gradient(circle at 35% 35%, #e8e4d8, #d4cfc0 50%, #bab5a5 80%, #a09a88)",
          boxShadow:
            "0 0 12px rgba(220,215,195,0.35), 0 0 40px rgba(200,195,175,0.1)",
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 4: 바다 위 달빛 반사
      ──────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "8%",
          top: `${HORIZON_PCT * 100 + 1}%`,
          width: "12%",
          height: "28%",
          background:
            "linear-gradient(180deg, rgba(180,190,210,0.06) 0%, rgba(140,160,195,0.03) 40%, transparent 100%)",
          filter: "blur(8px)",
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 5: 수평선 발광
      ──────────────────────────────────────────── */}
      {/* 수평선 대기 산란 (넓은 glow) */}
      <div
        className="absolute w-full pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 4}%`,
          height: "8%",
          background:
            "radial-gradient(ellipse 130% 100% at 50% 80%, rgba(40,70,120,0.1) 0%, transparent 65%)",
        }}
      />
      {/* 수평선 하이라이트 */}
      <div
        className="absolute w-full horizon-glow pointer-events-none"
        style={{
          top: `${HORIZON_PCT * 100 - 0.3}%`,
          height: "0.8%",
          background:
            "linear-gradient(180deg, transparent 10%, rgba(60,100,160,0.1) 50%, transparent 90%)",
        }}
      />

      {/* ────────────────────────────────────────────
          레이어 5: 표류 중인 유리병들 (바다)
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
          레이어 6: 해안 파도 SVG
      ──────────────────────────────────────────── */}
      <svg
        className="absolute w-full pointer-events-none"
        style={{
          top: `${SHORE_PCT * 100 - 3.5}%`,
          height: "7%",
          zIndex: 22,
        }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          className="animate-shore-wave-back"
          fill="rgba(12, 45, 85, 0.6)"
          d="M0,35 C360,50 720,20 1080,35 C1260,43 1380,28 1440,35 L1440,80 L0,80 Z"
        />
        <path
          className="animate-shore-wave-front"
          fill="rgba(8, 35, 70, 0.7)"
          d="M0,50 C240,38 480,62 720,50 C960,38 1200,62 1440,50 L1440,80 L0,80 Z"
        />
        {/* 거품 하이라이트 */}
        <path
          className="animate-shore-wave-front"
          fill="rgba(160,190,220,0.08)"
          d="M0,48 C240,36 480,60 720,48 C960,36 1200,60 1440,48 L1440,53 L0,53 Z"
        />
      </svg>

      {/* ────────────────────────────────────────────
          레이어 7: 해변 유리병들 (빈 병 → 메모 → 봉인 → 드래그)
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
          사이드 던지기 버튼 (폴백)
      ──────────────────────────────────────────── */}
      <button
        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/15 text-white/60 hover:bg-white/15 hover:text-white/90 transition-all active:scale-95"
        onClick={() => setThrowOpen(true)}
        aria-label="고민 던지기"
        title="고민 던지기"
      >
        <span className="text-lg">🍾</span>
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
          빈 바다 안내 (바다 병이 없을 때)
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
