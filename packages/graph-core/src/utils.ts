export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundLayoutNumber(value: number) {
  return Math.round(value * 100) / 100;
}

export function finiteOrDefault(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

export function clampZoomValue(value: number | undefined) {
  const zoom = finiteOrDefault(value, 1);
  return zoom > 0 ? clamp(zoom, 0.35, 2.5) : 1;
}

export function normalizeSourceKey(sourceType?: string) {
  const key = sourceType?.trim().toLowerCase();
  return key || "free";
}
