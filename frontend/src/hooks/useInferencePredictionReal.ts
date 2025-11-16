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
  const [isDefault, setIsDefault] = useState(true)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastText = useRef("")
  const requestId = useRef(0)
  const wasJustSent = useRef(false)

  const markJustSent = () => {
    wasJustSent.current = true
  }

  const updatePredictionFromInput = (text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    const trimmed = text.trim()
    lastText.current = text

    if (!trimmed) {
      if (wasJustSent.current) {
        wasJustSent.current = false
        setPrediction(DEFAULT)
        setIsDefault(true)
        return
      }

      requestId.current++
      setPrediction(DEFAULT)
      setIsDefault(true)
      setDebugInfo(null)
      return
    }

    wasJustSent.current = false
    const thisRequest = ++requestId.current

    debounceTimer.current = setTimeout(async () => {
      const p = lastText.current.trim()
      if (!p) return

      try {
        const data = await fetchPrediction(p)
        if (thisRequest !== requestId.current) return

        setIsDefault(false)
        setDebugInfo(data.debug ?? null)

        const clamp = (v: any, fallback: number) => {
          const n = Number(v)
          if (!Number.isFinite(n)) return fallback
          return Math.min(100, Math.max(0, Math.round(n)))
        }

        setPrediction({
          complexity: clamp(data.complexity, 50),
          confidence: clamp(data.confidence, 70),
        })
      } catch (err) {
        if (thisRequest !== requestId.current) return
        console.error("prediction failed:", err)
        setPrediction(DEFAULT)
        setIsDefault(true)
      }
    }, 200)
  }

  const resetPrediction = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    requestId.current++
    lastText.current = ""
    setPrediction(DEFAULT)
    setIsDefault(true)
  }

  return {
    prediction,
    updatePredictionFromInput,
    resetPrediction,
    debugInfo,
    isDefault,
    markJustSent,
  }
}