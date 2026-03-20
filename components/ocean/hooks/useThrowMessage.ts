"use client";

import { useState } from "react";
import { validateMessageContent } from "@/lib/validation";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";
import { useSubmitBottle } from "../OceanBottlesContext";

type Stage = "write" | "throwing" | "done";

export function useThrowMessage() {
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [stage, setStage] = useState<Stage>("write");
  const [error, setError] = useState("");
  const submitBottle = useSubmitBottle();

  /** 검증 → API 호출 → 낙관적 업데이트 → "throwing" 단계 진입 */
  const handleThrow = async (): Promise<boolean> => {
    const validation = validateMessageContent(content);
    if (!validation.ok) {
      setError(validation.error);
      return false;
    }
    setError("");

    const result = await submitBottle(content, options);
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
