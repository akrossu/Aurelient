// src/hooks/useDepthAutoFollow.ts
import { useRef, useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

export function useDepthAutoFollow(
  mean: number,
  locked: boolean,
  userIsControlling: boolean,
  setDepthRaw: Dispatch<SetStateAction<number>>
) {
  const lastUserControlTime = useRef(Date.now())
  const meanRef = useRef(mean)

  useEffect(() => {
    meanRef.current = mean
  }, [mean])

  useEffect(() => {
    let frame: number

    const tick = () => {
      const elapsed = Date.now() - lastUserControlTime.current
      const allowFollow =
        !locked && !userIsControlling && elapsed > 800

      if (allowFollow) {
        setDepthRaw(prev => {
          const target = meanRef.current
          const alpha = 0.05
          const next = prev + (target - prev) * alpha
          return Math.abs(next - target) < 0.0004 ? target : next
        })
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [locked, userIsControlling, setDepthRaw])

  return {
    markUserControlStart() {
      lastUserControlTime.current = Date.now()
    },
    markUserControlEnd() {
      lastUserControlTime.current = Date.now()
    },
  }
}