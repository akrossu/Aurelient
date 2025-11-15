// src/services/predictionApi.ts
export interface InferencePrediction {
  complexity: number
  confidence: number
}

export async function fetchPrediction(
  prompt: string,
): Promise<InferencePrediction> {
  const res = await fetch('http://localhost:4000/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    throw new Error(`backend error: ${res.status}`)
  }

  const data = await res.json()

  // hard validation
  if (
    typeof data.complexity !== 'number' ||
    typeof data.confidence !== 'number'
  ) {
    throw new Error('backend returned invalid shape')
  }

  const c = Math.round(data.complexity)
  const f = Math.round(data.confidence)

  // strict clamping
  const complexity =
    c >= 1 && c <= 100 ? c : (() => { throw new Error('invalid complexity') })()

  const confidence =
    f >= 1 && f <= 100 ? f : (() => { throw new Error('invalid confidence') })()

  return { complexity, confidence }
}
