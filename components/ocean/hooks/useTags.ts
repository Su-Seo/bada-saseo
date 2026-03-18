"use client";

import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api";

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchJSON<{ tags: Array<{ name: string }> }>("/api/tags")
      .then((data) => {
        if (!cancelled && data) {
          setTags(data.tags.map((t) => t.name));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { tags, loading };
}
