import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface DevBoundariesContextType {
  enabled: boolean
  toggle: () => void
}

const DevBoundariesContext = createContext<DevBoundariesContextType>({
  enabled: false,
  toggle: () => {},
})

export function DevBoundariesProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  const toggle = () => setEnabled(v => !v)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <DevBoundariesContext.Provider value={{ enabled, toggle }}>
      {children}
    </DevBoundariesContext.Provider>
  )
}

export function useDevBoundaries() {
  return useContext(DevBoundariesContext)
}