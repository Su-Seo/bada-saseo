"use client";

import { THEME_MODE } from "./hooks/useOceanTheme";
import type { ThemeMode } from "./hooks/useOceanTheme";

interface Props {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDaytime: boolean;
}

export default function ThemeToggle({ themeMode, setThemeMode, isDaytime }: Props) {
  const btnActive = isDaytime ? "bg-black/20 text-white" : "bg-white/20 text-white/90";
  const btn = isDaytime
    ? "text-white/70 hover:text-white"
    : "text-white/30 hover:text-white/60";

  return (
    <div className="flex items-center gap-1">
      {([THEME_MODE.AUTO, THEME_MODE.DARK, THEME_MODE.LIGHT] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setThemeMode(mode)}
          className={`p-1.5 rounded-lg transition-all ${
            themeMode === mode ? btnActive : btn
          }`}
          aria-label={
            mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"
          }
          title={
            mode === THEME_MODE.DARK ? "밤" : mode === THEME_MODE.LIGHT ? "낮" : "내 시간대"
          }
        >
          {mode === THEME_MODE.DARK && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C13.92 3.04 13.46 3 12 3z" />
            </svg>
          )}
          {mode === THEME_MODE.LIGHT && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
            </svg>
          )}
          {mode === THEME_MODE.AUTO && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
