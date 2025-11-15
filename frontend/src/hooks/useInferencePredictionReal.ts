// src/hooks/useInferencePredictionReal.ts
import { useState, useRef } from "react"
import { fetchPrediction } from "../services/predictionApi"
import type { InferencePrediction } from "@/services/predictionApi"
import type { PredictionDebugInfo } from "@/components/DebugPanel"

const DEFAULT: InferencePrediction = {
  complexity: 50,
  confidence: 70,
  suggestions: [],    // <-- required by the new type
  debug: null,
}

export default function useInferencePredictionReal() {
  const [prediction, setPrediction] = useState<InferencePrediction>(DEFAULT)
  const [debugInfo, setDebugInfo] = useState<PredictionDebugInfo | null>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastText = useRef("")

  const updatePredictionFromInput = (text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    lastText.current = text

    const trimmed = text.trim()
    if (!trimmed) {
      setPrediction(DEFAULT)
      setDebugInfo(null)
      return
    }

    debounceTimer.current = setTimeout(async () => {
      const p = lastText.current.trim()
      if (!p) {
        setPrediction(DEFAULT)
        setDebugInfo(null)
        return
      }

      try {
        const data = await fetchPrediction(p)

        // update debug panel
        setDebugInfo(data.debug ?? null)

        // predictionApi already validates + clamps
        setPrediction(data)
      } catch (err) {
        console.error("prediction failed:", err)
        setPrediction(DEFAULT)
        setDebugInfo(null)
      }
    }, 200)
  }

  const resetPrediction = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    lastText.current = ""
    setPrediction(DEFAULT)
    setDebugInfo(null)
  }

  return {
    prediction,
    updatePredictionFromInput,
    resetPrediction,
    debugInfo,
  }
}