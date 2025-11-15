// src/hooks/useInferencePredictionReal.ts
import { useState, useRef } from 'react'
import { fetchPrediction } from '../services/predictionApi'
import type { PredictionDebugInfo } from '@/components/DebugPanel'

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
  const lastText = useRef('')

  const updatePredictionFromInput = (text: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    lastText.current = text
    const trimmed = text.trim()

    if (!trimmed) {
      setPrediction(DEFAULT)
      return
    }

    debounceTimer.current = setTimeout(async () => {
      const p = lastText.current.trim()
      if (!p) {
        setPrediction(DEFAULT)
        return
      }

      try {
        const data = await fetchPrediction(p)

        setDebugInfo(data.debug ?? null)

        const complexity = Math.min(100, Math.max(1, Math.round(data.complexity)))
        const confidence = Math.min(100, Math.max(1, Math.round(data.confidence)))

        setPrediction({ complexity, confidence })
      } catch (err) {
        console.error('prediction failed:', err)
        setPrediction(DEFAULT)
      }
    }, 200)
  }

  const resetPrediction = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    lastText.current = ''

    setPrediction(DEFAULT)
  }

  return { prediction, updatePredictionFromInput, resetPrediction, debugInfo }
}