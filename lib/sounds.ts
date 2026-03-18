let _sfxVolume = 0;
let _sfxEnabled = false;

export function setSfxVolume(volume: number, enabled: boolean): void {
  _sfxVolume = volume;
  _sfxEnabled = enabled;
}

export function playSplash(): void {
  if (typeof window === "undefined" || !_sfxEnabled) return;
  const audio = new Audio("/sounds/splash-water.wav");
  audio.volume = _sfxVolume;
  audio.play().catch(() => {});
}

export function playBottlePop(): void {
  if (typeof window === "undefined" || !_sfxEnabled) return;
  const audio = new Audio("/sounds/open-bottle.mp3");
  audio.volume = _sfxVolume;
  audio.play().catch(() => {});
}

export function playBreakingBottle(): void {
  if (typeof window === "undefined" || !_sfxEnabled) return;
  const audio = new Audio("/sounds/broken-bottle.mp3");
  audio.volume = _sfxVolume * 0.5;
  audio.currentTime = 0.3; // mp3 앞부분 묵음 구간 스킵
  audio.play().catch(() => {});
}
