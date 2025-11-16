import { useState, useEffect } from "react"

let totalEnergy = 0
const listeners = new Set<(n: number) => void>()

export function addEnergy(wh: number) {
  totalEnergy += wh
  for (const fn of listeners) fn(totalEnergy)
}

export function useTotalEnergy() {
  const [value, setValue] = useState(totalEnergy)

  useEffect(() => {
    listeners.add(setValue)
    return () => {
      listeners.delete(setValue) // must not return boolean
    }
  }, [])

  return value
}