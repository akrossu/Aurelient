import { useState } from "react"
import type { Message } from "@/types/Message"
import { streamChat } from "@/services/streamChat"
import type { TuningParameters } from "@/types/TuningParameters"

import { addEnergy } from "@/stores/useEnergyStore"  // <-- NEW

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

    // add user + empty assistant message immediately
    setMessages(prev => [...prev, userMsg, assistantMsg])

    try {
      // history used for LLM (avoid stale closure)
      const historyForLLM = [...messages, userMsg]

      await streamChat(
        historyForLLM,
        tuning,

        // streaming token callback
        token => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          )
        },

        // metrics callback (fires once)
        metrics => {
          // apply metrics to assistant message
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, metrics }
                : m
            )
          )

          // ENERGY TRACKING
          if (metrics?.estimatedEnergyWh != null) {
            addEnergy(metrics.estimatedEnergyWh)
          }
        }
      )
    } catch (err) {
      console.error("[streamChat error]", err)

      // fallback system error message
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