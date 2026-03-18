"use client";

import { useState } from "react";
import { postMessage } from "@/lib/api";
import { validateMessageContent } from "@/lib/validation";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";

type State = "empty" | "writing" | "filled" | "throwing";

export function useBeachCompose() {
  const [state, setState] = useState<State>("empty");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [error, setError] = useState("");

  const open = () => {
    if (state === "empty") setState("writing");
  };

  const seal = () => {
    const validation = validateMessageContent(content);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError("");
    setState("filled");
  };

  const cancel = () => {
    setContent("");
    setError("");
    setOptions(DEFAULT_COMPOSE_OPTIONS);
    setState("empty");
  };

  /** 던지기 실행 — 에러 시 false 반환 + 에러 상태 설정 */
  const submit = async (): Promise<boolean> => {
    setState("throwing");
    const result = await postMessage(content, options);
    if (!result.ok) {
      setError(result.error ?? "전송에 실패했습니다.");
      setState("filled");
      return false;
    }
    return true;
  };

  const updateOptions = (updates: Partial<ComposeOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }));
  };

  return {
    state,
    content,
    setContent,
    options,
    updateOptions,
    error,
    open,
    seal,
    cancel,
    submit,
  };
}
