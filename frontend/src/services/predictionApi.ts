// src/services/predictionApi.ts

export interface InferencePrediction {
  complexity: number
  confidence: number
  suggestions: string[]       // <-- new
  debug?: any
}

export async function fetchPrediction(
  prompt: string,
): Promise<InferencePrediction> {
  const res = await fetch("http://localhost:4000/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    throw new Error(`backend error: ${res.status}`)
  }

  const data = await res.json()

  // ---- VALIDATE REQUIRED FIELDS ----
  if (
    typeof data.complexity !== "number" ||
    typeof data.confidence !== "number"
  ) {
    throw new Error("backend returned invalid shape")
  }

  const c = Math.round(data.complexity)
  const f = Math.round(data.confidence)

  if (c < 1 || c > 100) throw new Error("invalid complexity")
  if (f < 1 || f > 100) throw new Error("invalid confidence")

  // ---- VALIDATE OPTIONAL SUGGESTIONS ----
  let suggestions: string[] = []
  if (Array.isArray(data.suggestions)) {
    const arr: unknown[] = data.suggestions
    suggestions = arr.filter((s): s is string => typeof s === "string")
  }

  return {
    complexity: c,
    confidence: f,
    suggestions,
    debug: data.debug ?? null,
  }
}