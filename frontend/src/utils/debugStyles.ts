import { useDevBoundaries } from "@/context/DevBoundariesContext"

export function useDebugClass(color: string) {
  const { enabled } = useDevBoundaries()

  return enabled
    ? `debug-outline-${color}`
    : ""
}