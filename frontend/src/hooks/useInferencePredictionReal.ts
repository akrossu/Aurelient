// src/hooks/useInferencePredictionReal.ts
import { useState, useRef } from "react"
import { fetchPrediction } from "@/services/predictionApi"
import type { PredictionDebugInfo } from "@/components/DebugPanel"

export interface InferencePrediction {
  complexity: number
  confidence: number
}

const DEFAULT: InferencePrediction = {
  complexity: 50,
  confidence: 70,
}

export default function useInferencePredictionReal() {
  const [prediction, setPrediction] = useState<InferencePrediction>(DEFAULT)
  const [debugInfo, setDebugInfo] = useState<PredictionDebugInfo | null>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastText = useRef("")
  const requestId = useRef(0)

  const updatePredictionFromInput = (text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    lastText.current = text
    const trimmed = text.trim()

    if (!trimmed) {
      requestId.current++
      setPrediction(DEFAULT)
      return
    }

    const thisRequest = ++requestId.current

    debounceTimer.current = setTimeout(async () => {
      const p = lastText.current.trim()
      if (!p) {
        if (thisRequest === requestId.current) setPrediction(DEFAULT)
        return
      }

      try {
        const data = await fetchPrediction(p)

        // ignore stale responses
        if (thisRequest !== requestId.current) return

        setDebugInfo(data.debug ?? null)

        // safe clamp
        const clamp01to100 = (v: any, fallback: number) => {
          const n = Number(v)
          if (!Number.isFinite(n)) return fallback
          return Math.min(100, Math.max(0, Math.round(n)))
        }

        setPrediction({
          complexity: clamp01to100(data.complexity, 50),
          confidence: clamp01to100(data.confidence, 70),
        })
      } catch (err) {
        // ignore stale requests even on failure
        if (thisRequest !== requestId.current) return

        console.error("prediction failed:", err)
        setPrediction(DEFAULT)
      }
    }, 200)
  }

  const resetPrediction = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    requestId.current++
    lastText.current = ""
    setPrediction(DEFAULT)
  }

  return {
    prediction,
    updatePredictionFromInput,
    resetPrediction,
    debugInfo,
  }
}