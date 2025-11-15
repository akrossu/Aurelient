export function calculateTuningParameters(depth: number) {
  const d = Math.min(1, Math.max(0, depth))

  // aggressive curves for dramatic effect
  const temperature = 0.05 + d * 1.15        // 0.05 → 1.20
  const topP = 0.75 + d * 0.25               // 0.75 → 1.0
  const maxTokens = Math.round(150 + d * 6000) // 150 → 6150 tokens

  let systemRole: string

  if (d < 0.15) {
    systemRole = [
      "respond extremely concisely",
      "avoid extended reasoning",
      "avoid speculation",
      "give the shortest possible direct answer",
    ].join("; ")
  } else if (d < 0.4) {
    systemRole = [
      "respond concisely but with clarity",
      "add brief reasoning only when necessary",
    ].join("; ")
  } else if (d < 0.7) {
    systemRole = [
      "provide structured reasoning",
      "explain thought process cleanly",
      "high clarity, medium depth",
    ].join("; ")
  } else if (d < 0.9) {
    systemRole = [
      "provide deep reasoning",
      "use multi-step explanations",
      "analyze context carefully before answering",
    ].join("; ")
  } else {
    systemRole = [
      "provide extremely deep, methodical reasoning",
      "explain logic step-by-step",
      "leave nothing implicit",
      "treat the prompt as requiring maximum inference effort",
    ].join("; ")
  }

  return {
    temperature,
    topP,
    maxTokens,
    systemRole,
  }
}