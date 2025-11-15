// src/services/streamChat.ts
export async function streamChat(
  prompt: string,
  tuning: {
    temperature: number
    maxTokens: number
    topP: number
    systemRole: string
  },
  onToken: (t: string) => void
) {
  let gotAnyTokens = false
  const res = await fetch("http://localhost:4000/api/chat-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, tuning }),
  })

  if (!res.ok || !res.body) {
    throw new Error("no body returned")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // split into SSE lines
    const parts = buffer.split("\n\n")
    buffer = parts.pop() || ""

    for (const part of parts) {
      if (!part.startsWith("data:")) continue
      const jsonStr = part.slice(5).trim()
      if (!jsonStr) continue

      try {
        const parsed = JSON.parse(jsonStr)
        const token = parsed?.choices?.[0]?.delta?.content
        if (token) {
          gotAnyTokens = true
          onToken(token)
        }
      } catch {
        // ignore partial JSON
      }
    }
  }
  
  if (!gotAnyTokens) {
    onToken("[LLM OFFLINE: No response received]")
  }
}