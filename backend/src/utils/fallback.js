export function fallbackPrediction(prompt) {
  const txt = (prompt || "").trim();
  if (!txt) return { complexity: 50, confidence: 70 };

  const len = txt.length;
  const c = Math.min(100, Math.max(0, Math.round(len / 4)));
  const conf = Math.min(100, Math.max(0, 100 - Math.round(len / 6)));

  return { complexity: c, confidence: conf };
}
