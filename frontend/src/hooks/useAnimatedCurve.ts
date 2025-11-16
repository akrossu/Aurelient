// src/hooks/useAnimatedCurve.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import type { InferencePrediction } from '@/types/InferencePrediction'

const DEFAULT_MEAN = 0.5
const DEFAULT_SIGMA = 0.18

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export default function useAnimatedCurve(pred: InferencePrediction) {
  const [mean, setMean] = useState(DEFAULT_MEAN)
  const [sigma, setSigma] = useState(DEFAULT_SIGMA)

  // convert 1–100 to 0–1
  // we're using 1-100 for the preprocessing model because it hates floats
  const cx = clamp01(pred.complexity / 100)
  const cf = clamp01(pred.confidence / 100)

  const targetMean = 0.10 + cx * 0.80
  const targetSigma = 0.06 + Math.pow(1 - cf, 2) * 0.22

  const meanRef = useRef(mean)
  const sigmaRef = useRef(sigma)

  useEffect(() => { meanRef.current = mean }, [mean])
  useEffect(() => { sigmaRef.current = sigma }, [sigma])

  useEffect(() => {
    const speed = 0.20      // much faster! (previous was 0.06)
    let frame: number

    const tick = () => {
      const m = meanRef.current
      const s = sigmaRef.current

      const nextM = m + (targetMean - m) * speed
      const nextS = s + (targetSigma - s) * speed

      if (Math.abs(nextM - m) > 0.0001) setMean(nextM)
      if (Math.abs(nextS - s) > 0.0001) setSigma(nextS)

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [targetMean, targetSigma])

  const resetCurve = useCallback(() => {
    setMean(DEFAULT_MEAN)
    setSigma(DEFAULT_SIGMA)
  }, [])

  return { mean, sigma, resetCurve }
}
