// src/hooks/useInferenceDepth.ts
import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"

export function useInferenceDepth(initial = 0.5) {
  const [depth, setDepthValue] = useState<number>(initial)
  const [locked, setLocked] = useState(false)
  const [userIsControlling, setUserIsControlling] = useState(false)

  const setDepth: Dispatch<SetStateAction<number>> = v => {
    setLocked(true)
    setDepthValue(v)
  }

  const setDepthRaw: Dispatch<SetStateAction<number>> = v => {
    setDepthValue(v)
  }

  const beginControl = () => {
    setUserIsControlling(true)
    setLocked(true)
  }

  const endControl = () => {
    setUserIsControlling(false)
  }

  const unlock = () => {
    setLocked(false)
  }

  return {
    depth,
    setDepth,
    setDepthRaw,
    locked,
    setLocked,
    unlock,
    userIsControlling,
    beginControl,
    endControl,
  }
}