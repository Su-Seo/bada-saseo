"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BottleData } from "../FloatingBottle";
import { MAX_BOTTLES } from "../constants";
import { rand, uid } from "@/lib/utils";
import { fetchJSON } from "@/lib/api";

function createBottle(messageId: string, bottleColor?: string | null): BottleData {
  return {
    id: uid("b"),
    messageId,
    x: rand(10, 84),
    xDrift: rand(-45, 45),
    duration: rand(20, 30),
    bottleColor: bottleColor ?? null,
  };
}

export function useOceanBottles() {
  const [bottles, setBottles] = useState<BottleData[]>([]);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const queueRef = useRef<string[]>([]);

  const addBottle = useCallback((messageId: string, bottleColor?: string | null) => {
    setBottles((prev) => {
      if (prev.length >= MAX_BOTTLES) {
        queueRef.current.push(messageId);
        return prev;
      }
      return [...prev, createBottle(messageId, bottleColor)];
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
          bottleColor?: string | null;
        };

        if (data.type === "bottle" && data.messageId) {
          if (data.createdAt) since = data.createdAt;
          addBottle(data.messageId, data.bottleColor);
          setTodayCount((n) => (n !== null ? n + 1 : 1));
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

  // ── 오늘 통계 로드 ────────────────────────────────
  useEffect(() => {
    fetchJSON<{ todayCount?: number }>("/api/stats").then((data) => {
      if (typeof data?.todayCount === "number") setTodayCount(data.todayCount);
    });
  }, []);

  return { bottles, addBottle, removeBottle, todayCount };
}
