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
      content: trimmed
    }

    const assistantId = crypto.randomUUID()

    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      tuning
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])

    try {
      await streamChat(
        [...messages, userMsg],
        tuning,
        token => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          )
        }
      )
    } catch (err) {
      console.error("[streamChat error]", err)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "LLM unavailable.\n\nMake sure LM Studio is running on port 1234."
              }
            : m
        )
      )
    }
  }

  return { messages, sendMessage, clearMessages }
}