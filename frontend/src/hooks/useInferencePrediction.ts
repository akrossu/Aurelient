import { useState, useRef } from 'react'

export interface InferencePrediction {
  complexity: number
  confidence: number
}

const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v))

export default function useInferencePrediction() {
  const [prediction, setPrediction] = useState<InferencePrediction>({
    complexity: 0.5,
    confidence: 0.7,
  })

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // weird function deviations here are used for making the curve look more "alive"
  // kinda unnoticeable but it was cool when i implemented it so i'm just not gonna touch it
  const computePrediction = (text: string): InferencePrediction => {
    if (!text.trim()) {
      // fully stable baseline when empty
      return { complexity: 0.5, confidence: 0.7 }
    }

    const len = text.length

    // core signal
    let baseComplexity = 1 - Math.exp(-len / 95)
    let baseConfidence = 0.45 + Math.min(0.55, len / 240)

    // tiny jitter (always present)
    baseComplexity += (Math.random() - 0.5) * 0.06
    baseConfidence += (Math.random() - 0.5) * 0.04

    // 10% chance of a stronger “thought wobble”
    if (Math.random() < 0.1) {
      baseComplexity += (Math.random() - 0.5) * 0.18
    }
    if (Math.random() < 0.08) {
      baseConfidence += (Math.random() - 0.5) * 0.12
    }

    // inverse tendency: more complexity -> lower confidence
    baseConfidence -= (baseComplexity - 0.5) * 0.1

    return {
      complexity: clamp(baseComplexity, 0, 1),
      confidence: clamp(baseConfidence, 0, 1),
    }
  }

  const updatePredictionFromInput = (text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      setPrediction(computePrediction(text))
    }, 260)
  }

  const resetPrediction = () => {
    setPrediction({ complexity: 0.5, confidence: 0.7 })
  }

  return { prediction, updatePredictionFromInput, resetPrediction }
}
