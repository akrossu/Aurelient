import { useState } from "react"
import type { Message } from "@/types/Message"
import { streamChat } from "@/services/streamChat"
import { calculateTuningParameters } from "@/inferenceTuning"

export function useChatEngine(depth: number, userTouched: boolean) {
  const [messages, setMessages] = useState<Message[]>([])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const effectiveDepth = userTouched ? depth : 1.0
    const tuning = calculateTuningParameters(effectiveDepth)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    }

    const assistantId = crypto.randomUUID()

    const assistantPlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      tuning
    }

    setMessages(prev => [...prev, userMsg, assistantPlaceholder])

    const historyForLLM = [...messages, userMsg]

    await streamChat(historyForLLM, tuning, token => {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content + token }
            : m
        )
      )
    })
  }

  return { messages, send }
}