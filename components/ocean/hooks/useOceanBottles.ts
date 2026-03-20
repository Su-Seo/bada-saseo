"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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

type BottleState = { bottles: BottleData[]; queue: string[] };
type BottleAction =
  | { type: "add"; messageId: string; bottleColor?: string | null }
  | { type: "remove"; bottleId: string };

function bottleReducer(state: BottleState, action: BottleAction): BottleState {
  if (action.type === "add") {
    if (state.bottles.length >= MAX_BOTTLES) {
      return { ...state, queue: [...state.queue, action.messageId] };
    }
    return { ...state, bottles: [...state.bottles, createBottle(action.messageId, action.bottleColor)] };
  }
  if (action.type === "remove") {
    const next = state.bottles.filter((b) => b.id !== action.bottleId);
    if (next.length < MAX_BOTTLES && state.queue.length > 0) {
      const [queued, ...rest] = state.queue;
      return { bottles: [...next, createBottle(queued)], queue: rest };
    }
    return { ...state, bottles: next };
  }
  return state;
}

export function useOceanBottles() {
  const [state, dispatch] = useReducer(bottleReducer, { bottles: [], queue: [] });
  const [todayCount, setTodayCount] = useState<number | null>(null);
  // 낙관적으로 추가한 messageId 추적 — SSE 중복 방지용
  const myBottleIds = useRef(new Set<string>());

  const addBottle = useCallback((messageId: string, bottleColor?: string | null) => {
    dispatch({ type: "add", messageId, bottleColor });
  }, []);

  const removeBottle = useCallback((bottleId: string) => {
    dispatch({ type: "remove", bottleId });
  }, []);

  /** 내가 던진 병: 즉시 UI 업데이트 + SSE 중복 방지 등록 */
  const addMyBottle = useCallback((messageId: string, bottleColor: string | null) => {
    myBottleIds.current.add(messageId);
    dispatch({ type: "add", messageId, bottleColor });
    setTodayCount((n) => (n !== null ? n + 1 : 1));
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
          // 낙관적으로 이미 추가한 내 병은 중복 추가 방지
          if (myBottleIds.current.has(data.messageId)) {
            myBottleIds.current.delete(data.messageId);
          } else {
            addBottle(data.messageId, data.bottleColor);
            setTodayCount((n) => (n !== null ? n + 1 : 1));
          }
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

  return {
    bottles: state.bottles,
    addBottle,
    addMyBottle,
    removeBottle,
    todayCount,
    pendingCount: state.bottles.length + state.queue.length,
  };
}
