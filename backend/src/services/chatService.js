// backend/src/services/chatService.js

import { performance } from "node:perf_hooks"
import { callLMStudio } from "../integrations/lmStudioApi.js"
import { sendSSE } from "../utils/sse.js"
import { computeEnergyMetrics } from "../utils/energy.js"

export async function runChatStream(history, tuning, res) {
  const {
    temperature = 0.5,
    maxTokens = 500,
    topP = 1.0,
    systemRole = "respond normally",
    inferenceDepth = 1.0
  } = tuning || {}

  const depth = Math.min(1, Math.max(0, inferenceDepth))

  const llmHistory = history.map(m => ({
    role: m.role,
    content: m.content
  }))

  const body = {
    model: process.env.LMSTUDIO_MODEL,
    stream: true,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemRole },
      ...llmHistory
    ]
  }

  const startTime = performance.now()
  let tokenCount = 0

  const lm = await callLMStudio(body)

  if (!lm?.ok || !lm.body) {
    sendSSE(res, {
      choices: [
        { delta: { content: "[LLM ERROR: invalid response from LM Studio]" } }
      ]
    })
    return res.end()
  }

  const reader = lm.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const packets = buffer.split("\n\n")
    buffer = packets.pop() || ""

    for (const p of packets) {
      if (!p.startsWith("data:")) continue

      const raw = p.slice(5).trim()
      if (!raw || raw === "[DONE]") continue

      try {
        const json = JSON.parse(raw)
        const token = json?.choices?.[0]?.delta?.content
        if (token) {
          tokenCount++
          sendSSE(res, json)
        }
      } catch {}
    }
  }

  const runtimeMs = performance.now() - startTime

  // compute FLOP-based metrics
  const metrics = computeEnergyMetrics({
    tokens: tokenCount,
    depth,
    runtimeMs
  })

  sendSSE(res, {
    type: "metrics",
    metrics
  })

  res.end()
}