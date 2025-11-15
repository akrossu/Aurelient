import { useState, useRef } from "react"
import { fetchSuggestions } from "@/services/suggestionsApi"

export default function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastText = useRef("")

  const seemsComplete = (p: string) => {
    if (!p.trim()) return false
    if (/[.!?]$/.test(p)) return true
    if (p.endsWith("\n")) return true
    if (p.length > 24 && /\w$/.test(p)) return true
    return false
  }

  const updateSuggestions = (text: string) => {
    if (debounce.current) clearTimeout(debounce.current)

    lastText.current = text

    if (!text.trim()) {
      setSuggestions([])
      return
    }

    debounce.current = setTimeout(async () => {
      const p = lastText.current.trim()
      if (!p) return setSuggestions([])

      if (!seemsComplete(p)) {
        setSuggestions([])
        return
      }

      try {
        const list = await fetchSuggestions(p)
        setSuggestions(list)
      } catch {
        setSuggestions([])
      }
    }, 900)
  }

  const resetSuggestions = () => {
    if (debounce.current) clearTimeout(debounce.current)
    lastText.current = ""
    setSuggestions([])
  }

  return { suggestions, updateSuggestions, resetSuggestions }
}