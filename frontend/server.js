// server.js 
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 4000

// toggle fake vs real
const USE_FAKE = false

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

function forceInt0to100(v, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  if (n < 0 || n > 100) return fallback
  return Math.round(n)
}

function fallbackPrediction(prompt) {
  const txt = (prompt || '').trim()
  if (!txt) return { complexity: 50, confidence: 70 }

  const len = txt.length
  const c = Math.min(100, Math.max(0, Math.round(len / 4)))
  const conf = Math.min(100, Math.max(0, 100 - Math.round(len / 6)))
  return { complexity: c, confidence: conf }
}

// -------------------------------------------------------------
// REAL LM STUDIO PREDICTOR
// -------------------------------------------------------------
async function realPredict(req, res) {
  const { prompt } = req.body || {}
  const trimmed = (prompt || '').trim()

  console.log('\n--- REAL /api/predict ---')
  console.log('prompt:', JSON.stringify(trimmed))

  if (!trimmed) {
    const base = { complexity: 50, confidence: 70 }
    console.log('empty prompt ->', base)
    return res.json(base)
  }

  const body = {
    model: process.env.LMSTUDIO_MODEL || 'local-model',
    temperature: 0.1,
    max_tokens: 50,
    stream: false,
    messages: [
      {
        role: 'system',
        content:
          'respond ONLY with pure JSON: {"complexity": <int(1-100)>, "confidence": <int(1-100)>}, no text, no code fences.',
      },
      {
        role: 'user',
        content: trimmed,
      },
    ],
  }

  console.log('\n--- LM Studio Request ---')
  console.log(JSON.stringify(body, null, 2))

  let lmResp
  try {
    lmResp = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.log('LM Studio request failed:', err)
    const fb = fallbackPrediction(trimmed)
    console.log('fallback ->', fb)
    return res.json(fb)
  }

  let json
  try {
    json = await lmResp.json()
  } catch (err) {
    console.log('response not JSON:', err)
    const fb = fallbackPrediction(trimmed)
    console.log('fallback ->', fb)
    return res.json(fb)
  }

  console.log('\n--- LM Studio Response ---')
  console.log(JSON.stringify(json, null, 2))

  const raw = json?.choices?.[0]?.message?.content?.trim()
  if (!raw) {
    console.log('missing content -> fallback')
    const fb = fallbackPrediction(trimmed)
    return res.json(fb)
  }

  // will be some JSON data like {"complexity": 50, "confidence": 80} hopefully lol
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.log('invalid JSON from model:', raw)
    const fb = fallbackPrediction(trimmed)
    return res.json(fb)
  }

  const complexity = forceInt0to100(parsed.complexity, 50)
  const confidence = forceInt0to100(parsed.confidence, 70)

  const result = { complexity, confidence }
  console.log('validated result ->', result)

  return res.json({
    ...result,
    debug: {
      mode: 'real',
      prompt: trimmed,
      rawModelContent: raw,
      parsed,
    }
  })
}

// -------------------------------------------------------------
// FAKE PREDICTOR
// -------------------------------------------------------------
async function fakePredict(req, res) {
  const { prompt } = req.body || ''
  console.log('\n--- FAKE /api/predict ---')

  const delay = 150 + Math.random() * 200
  await new Promise(r => setTimeout(r, delay))

  const t = (prompt || '').trim()
  const out = t
    ? {
        complexity: Math.floor(Math.random() * 100) + 1,
        confidence: Math.floor(Math.random() * 100) + 1,
      }
    : { complexity: 50, confidence: 70 }

  console.log('fake ->', out)
  res.json({ 
    ...out,
    debug: {
      mode: 'fake',
      prompt: t,
    }
  })
}

// -------------------------------------------------------------
app.post('/api/predict', USE_FAKE ? fakePredict : realPredict)

app.listen(PORT, () => {
  console.log(`backend http://localhost:${PORT}`)
  console.log(`mode: ${USE_FAKE ? 'FAKE' : 'REAL'}`)
})

app.post("/api/chat-stream", async (req, res) => {
  const { prompt, tuning } = req.body || {}
  const trimmed = (prompt || "").trim()

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders()

  if (!trimmed) {
    res.write("data: {}\n\n")
    return res.end()
  }

  const {
    temperature = 0.5,
    maxTokens = 500,
    topP = 1.0,
    systemRole = "respond normally",
  } = tuning || {}

  const body = {
    model: "lmstudio-community/Meta-Llama-3.1-8B-Instruct",
    stream: true,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemRole },
      { role: "user", content: trimmed },
    ],
  }

  const lm = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!lm.ok || !lm.body) {
    res.write(`data: {"error": "LM Studio failed"}\n\n`)
    return res.end()
  }

  const reader = lm.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // LM Studio SSE packets end with \n\n
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
          res.write(`data: ${JSON.stringify(json)}\n\n`)
        }
      } catch {
        // partial JSON, ignore
      }
    }
  }

  res.end()
})