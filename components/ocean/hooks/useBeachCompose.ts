"use client";

import { useState } from "react";
import { validateMessageContent } from "@/lib/validation";
import { DEFAULT_COMPOSE_OPTIONS } from "@/lib/types";
import type { ComposeOptions } from "@/lib/types";
import { SPLASH_DELAY_MS } from "@/components/ocean/constants";
import { useSubmitBottle } from "../OceanBottlesContext";

type State = "empty" | "writing" | "filled" | "throwing" | "broken";

export function useBeachCompose() {
  const [state, setState] = useState<State>("empty");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<ComposeOptions>(DEFAULT_COMPOSE_OPTIONS);
  const [error, setError] = useState("");
  const [breakError, setBreakError] = useState("");
  const submitBottle = useSubmitBottle();

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
    setBreakError("");
    setOptions(DEFAULT_COMPOSE_OPTIONS);
    setState("empty");
  };

  const reset = () => {
    setContent("");
    setError("");
    setBreakError("");
    setOptions(DEFAULT_COMPOSE_OPTIONS);
    setState("empty");
  };

  /** 던지기 실행 — 낙관적 업데이트 포함. 에러 시 false 반환 */
  const submit = async (): Promise<boolean> => {
    setState("throwing");
    const [result] = await Promise.all([
      submitBottle(content, options),
      new Promise((r) => setTimeout(r, SPLASH_DELAY_MS - 150)), // 최소 비행 시간 보장
    ]);
    if (!result.ok) {
      setBreakError(result.error ?? "전송에 실패했습니다.");
      setState("broken");
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
    breakError,
    open,
    seal,
    cancel,
    reset,
    submit,
  };
}
