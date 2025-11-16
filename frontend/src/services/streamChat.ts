// src/services/streamChat.ts
import type { TuningParameters } from "@/types/TuningParameters"

export interface ChatMessageForLLM {
  role: "system" | "user" | "assistant"
  content: string
}

export interface FrontendMessage {
  id: string
  role: "user" | "assistant"
  content: string
  tuning?: any
}

export async function streamChat(
  history: FrontendMessage[],
  tuning: TuningParameters,
  onToken: (token: string) => void,
  onMetrics?: (m: any) => void
) {
  const llmHistory: ChatMessageForLLM[] = history.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  let gotAnyTokens = false

  const res = await fetch("http://localhost:4000/api/chat-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: llmHistory,
      tuning
    })
  })

  if (!res.ok || !res.body) {
    throw new Error("no body returned")
  }

  // SSE
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split("\n\n")
    buffer = parts.pop() || ""

    for (const part of parts) {
      if (!part.startsWith("data:")) continue

      const jsonStr = part.slice(5).trim()
      if (!jsonStr) continue

      try {
        const parsed = JSON.parse(jsonStr)

        // METRICS PACKET
        if (parsed.metrics) {
          if (onMetrics) onMetrics(parsed.metrics)
          continue
        }

        // TOKEN PACKET
        const token = parsed?.choices?.[0]?.delta?.content
        if (token) {
          gotAnyTokens = true
          onToken(token)
        }
      } catch {
        // ignore partial
      }
    }
  }

  if (!gotAnyTokens) {
    onToken("[LLM OFFLINE: No response received]")
  }
}