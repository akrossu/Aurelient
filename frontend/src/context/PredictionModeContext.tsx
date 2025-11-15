import { createContext, useContext, useState, type ReactNode } from 'react'

export type PredictionMode = 'real' | 'fake'

interface PredictionModeContextValue {
  mode: PredictionMode
  setMode: (m: PredictionMode) => void
  toggleMode: () => void
}

const PredictionModeContext = createContext<PredictionModeContextValue | null>(null)

export function PredictionModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PredictionMode>('real')

  const toggleMode = () => {
    setMode(m => (m === 'real' ? 'fake' : 'real'))
  }

  return (
    <PredictionModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </PredictionModeContext.Provider>
  )
}

export function usePredictionMode() {
  const ctx = useContext(PredictionModeContext)
  if (!ctx) throw new Error('usePredictionMode must be used inside <PredictionModeProvider>')
  return ctx
}