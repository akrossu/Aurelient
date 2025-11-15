// server.js
import express from "express"
import cors from "cors"

const app = express()
const PORT = 4000
const USE_FAKE = false

app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

function forceInt1to100(v, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  if (n < 1 || n > 100) return fallback
  return Math.round(n)
}

function fallbackPrediction(prompt) {
  const t = (prompt || "").trim()
  if (!t) return { complexity: 50, confidence: 70 }

  const c = Math.min(100, Math.max(1, Math.round(t.length / 4)))
  const s = Math.min(100, Math.max(1, 100 - Math.round(t.length / 6)))
  return { complexity: c, confidence: s }
}

function promptSeemsComplete(prompt) {
  const p = prompt.trim()
  if (!p) return false
  if (/[.!?]$/.test(p)) return true
  if (p.endsWith("\n")) return true
  if (p.length > 24 && /\w$/.test(p)) return true
  return false
}

// -------------------------------------------------------------
// FAST predictor (complexity only)
// -------------------------------------------------------------
async function realPredict(req, res) {
  const { prompt } = req.body || {};
  const trimmed = (prompt || "").trim();

  if (!trimmed) {
    return res.json({
      complexity: 50,
      confidence: 70,
      debug: { mode: "empty" }
    });
  }

  const body = {
    model: "lmstudio-community/Meta-Llama-3.1-8B-Instruct", // <-- FIX THIS
    temperature: 0.1,
    max_tokens: 50,
    messages: [
      {
        role: "system",
        content:
          "Respond with ONLY a raw JSON object: {\"complexity\":<1-100>,\"confidence\":<1-100>} No text."
      },
      { role: "user", content: trimmed }
    ]
  };

  let resp;
  try {
    resp = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    return res.json({
      ...fallbackPrediction(trimmed),
      debug: { mode: "lm-connection-fail", error: String(err) }
    });
  }

  let j;
  try {
    j = await resp.json();
  } catch (err) {
    return res.json({
      ...fallbackPrediction(trimmed),
      debug: { mode: "bad-json-root", error: String(err) }
    });
  }

  // --------- SAFE CONTENT EXTRACTION ----------
  let raw =
    j?.choices?.[0]?.message?.content ??
    j?.choices?.[0]?.text ??
    "";

  if (!raw) {
    return res.json({
      ...fallbackPrediction(trimmed),
      debug: { mode: "no-content", json: j }
    });
  }

  raw = raw.trim();

  // strip markdown fences if present
  if (raw.startsWith("```")) {
    raw = raw.replace(/```[\s\S]*?```/g, "");
  }

  // extract JSON substring if model added text
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return res.json({
      ...fallbackPrediction(trimmed),
      debug: { mode: "no-json-object", raw }
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch (err) {
    return res.json({
      ...fallbackPrediction(trimmed),
      debug: { mode: "bad-json-parse", raw, error: String(err) }
    });
  }

  // ---------- finalize ----------
  return res.json({
    complexity: forceInt1to100(parsed.complexity, 50),
    confidence: forceInt1to100(parsed.confidence, 70),
    debug: { mode: "ok", raw, parsed }
  });
}


async function fakePredict(req, res) {
  const { prompt } = req.body || ""
  const t = (prompt || "").trim()

  await new Promise(r => setTimeout(r, 120))

  const out = t
    ? {
        complexity: Math.floor(Math.random() * 100) + 1,
        confidence: Math.floor(Math.random() * 100) + 1
      }
    : { complexity: 50, confidence: 70 }

  res.json({ ...out, debug: { mode: "fake" } })
}

app.post("/api/predict", USE_FAKE ? fakePredict : realPredict)

app.post("/api/suggestions", async (req, res) => {
  const { prompt } = req.body || {};
  const trimmed = (prompt || "").trim();

  // filter incomplete prompts (same rules as frontend)
  if (!promptSeemsComplete(trimmed)) {
    return res.json({ suggestions: [] });
  }

  const body = {
    model: "lmstudio-community/Meta-Llama-3.1-8B-Instruct", // <-- match predict
    temperature: 0.6,
    max_tokens: 160,
    messages: [
      {
        role: "system",
        content: `
Only return raw JSON. No commentary.
{
  "suggestions": [
    "lvl1",
    "lvl2",
    "lvl3",
    "lvl4",
    "lvl5"
  ]
}
        `.trim()
      },
      { role: "user", content: trimmed }
    ]
  };

  let resp;
  try {
    resp = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    return res.json({ suggestions: [] });
  }

  let j;
  try {
    j = await resp.json();
  } catch {
    return res.json({ suggestions: [] });
  }

  // read from `.message.content` or `.text`
  let raw =
    j?.choices?.[0]?.message?.content ??
    j?.choices?.[0]?.text ??
    "";

  if (!raw || typeof raw !== "string") {
    return res.json({ suggestions: [] });
  }

  raw = raw.trim();

  // strip markdown fences
  if (raw.startsWith("```")) {
    raw = raw.replace(/```[\s\S]*?```/g, "");
  }

  // extract any JSON object inside text
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return res.json({ suggestions: [] });
  }

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return res.json({ suggestions: [] });
  }

  const arr = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.filter(s => typeof s === "string")
    : [];

  return res.json({
    suggestions: arr.slice(0, 5)
  });
});
