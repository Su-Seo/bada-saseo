"use client";

import { useState, useCallback } from "react";
import { fetchTodayBottles, type TodayBottleItem } from "@/lib/api";

export type { TodayBottleItem };

export function useTodayBottles() {
  const [messages, setMessages] = useState<TodayBottleItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (hearted: boolean) => {
    setLoading(true);
    setError(null);
    const data = await fetchTodayBottles(hearted);
    if (data === null) {
      setError("불러오는 중 오류가 발생했습니다.");
      setMessages(null);
    } else {
      setMessages(data);
    }
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setMessages(null);
    setError(null);
  }, []);

  return { messages, loading, error, fetchMessages, reset };
}
