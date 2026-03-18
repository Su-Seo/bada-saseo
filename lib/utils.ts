export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
