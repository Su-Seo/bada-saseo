"use client";

import { useState } from "react";
import { postMessage } from "@/lib/api";
import { validateMessageContent } from "@/lib/validation";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";

type Stage = "write" | "throwing" | "done";

export function useThrowMessage() {
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [stage, setStage] = useState<Stage>("write");
  const [error, setError] = useState("");

  /** 검증 → API 호출 → "throwing" 단계 진입. 성공 시 { messageId, bottleColor } 반환, 실패 시 null */
  const handleThrow = async (): Promise<{ messageId: string; bottleColor: string | null } | null> => {
    const validation = validateMessageContent(content);
    if (!validation.ok) {
      setError(validation.error);
      return null;
    }
    setError("");

    const result = await postMessage(content, options);
    if (!result.ok) {
      setError(result.error ?? "오류가 발생했습니다.");
      return null;
    }

    setStage("throwing");
    return { messageId: result.messageId ?? "", bottleColor: result.bottleColor ?? null };
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
