export function forceInt0to100(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  if (n < 0 || n > 100) return fallback;
  return Math.round(n);
}
