"use client";

import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api";

// 모듈 레벨 캐시 — 동일 세션에서 중복 fetch 방지
let _cache: string[] | null = null;

export function useTags() {
  const [tags, setTags] = useState<string[]>(_cache ?? []);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache !== null) {
      setTags(_cache);
      setLoading(false);
      return;
    }
    fetchJSON<{ tags: Array<{ name: string }> }>("/api/tags")
      .then((data) => {
        if (data) {
          _cache = data.tags.map((t) => t.name);
          setTags(_cache);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { tags, loading };
}
