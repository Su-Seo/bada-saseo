"use client";

import { useEffect, useState } from "react";

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
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: { tags: Array<{ name: string }> }) => {
        _cache = data.tags.map((t) => t.name);
        setTags(_cache);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { tags, loading };
}
