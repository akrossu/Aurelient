// src/services/suggestionsApi.ts

export async function fetchSuggestions(prompt: string): Promise<string[]> {
  const res = await fetch("http://localhost:4000/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    console.error("suggestions backend error:", res.status)
    return []
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return []
  }

  // guard against malformed responses
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as any).suggestions)
  ) {
    return []
  }

  // strict type filtering
  const suggestions = (data as any).suggestions.filter(
    (s: unknown): s is string => typeof s === "string"
  )

  return suggestions.slice(0, 5)
}