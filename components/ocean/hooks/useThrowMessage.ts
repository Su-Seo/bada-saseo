"use client";

import { useState } from "react";
import { postMessage } from "@/lib/api";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";

type Stage = "write" | "throwing" | "done";

export function useThrowMessage() {
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [stage, setStage] = useState<Stage>("write");
  const [error, setError] = useState("");

  /** 검증 → API 호출 → "throwing" 단계 진입. 성공 여부를 반환 */
  const handleThrow = async (): Promise<boolean> => {
    if (!content.trim()) {
      setError("마음을 담아 적어주세요.");
      return false;
    }
    setError("");

    const result = await postMessage(content, options);
    if (!result.ok) {
      setError(result.error ?? "오류가 발생했습니다.");
      return false;
    }

    setStage("throwing");
    return true;
  };

  const complete = () => setStage("done");

  const reset = () => {
    setContent("");
    setOptions(DEFAULT_COMPOSE_OPTIONS);
    setStage("write");
  };

  return {
    content,
    setContent,
    options,
    setOptions,
    stage,
    error,
    handleThrow,
    complete,
    reset,
  };
}
