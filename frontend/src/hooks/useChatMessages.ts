import { useState } from "react"
import type { Message } from "@/types/Message"
import { streamChat } from "@/services/streamChat"
import type { TuningParameters } from "@/types/TuningParameters"

interface UseChatMessages {
  messages: Message[]
  sendMessage: (text: string, tuning: TuningParameters) => Promise<void>
  clearMessages: () => void
}

export function useChatMessages(): UseChatMessages {
  const [messages, setMessages] = useState<Message[]>([])

  const clearMessages = () => setMessages([])

  const sendMessage = async (text: string, tuning: TuningParameters) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    }

    const assistantId = crypto.randomUUID()

    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      tuning,
      metrics: null,
    }

    // use functional state update so `messages` isn't stale
    setMessages(prev => [...prev, userMsg, assistantMsg])

    try {
      const historyForLLM = (() => {
        const current = [
          ...messages,      // previous messages
          userMsg           // the new user message
        ]
        return current
      })()

      await streamChat(
        historyForLLM,
        tuning,

        // token callback
        token => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          )
        },

        // METRICS callback
        metrics => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, metrics }
                : m
            )
          )
        }
      )
    } catch (err) {
      console.error("[streamChat error]", err)

      // send fallback system message
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "LLM unavailable.\n\nMake sure LM Studio is running on port 1234.",
              }
            : m
        )
      )
    }
  }

  return { messages, sendMessage, clearMessages }
}