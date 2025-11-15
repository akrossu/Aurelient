import { buildPredictBody, callLMStudio } from "../integrations/lmStudioApi.js";
import { fallbackPrediction } from "../utils/fallback.js";
import { forceInt0to100 } from "../utils/validators.js";

export async function runRealPrediction(prompt) {
  const body = buildPredictBody(prompt);
  const resp = await callLMStudio(body);

  if (!resp) return fallbackPrediction(prompt);

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    console.log("response not JSON:", err);
    return fallbackPrediction(prompt);
  }

  const raw = json?.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    return fallbackPrediction(prompt);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.log("invalid JSON from model:", raw);
    return fallbackPrediction(prompt);
  }

  return {
    complexity: forceInt0to100(parsed.complexity, 50),
    confidence: forceInt0to100(parsed.confidence, 70),
    debug: { mode: "real", prompt, rawModelContent: raw, parsed },
  };
}

export async function runFakePrediction(prompt) {
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));

  const t = (prompt || "").trim();

  return {
    complexity: t ? Math.floor(Math.random() * 100) + 1 : 50,
    confidence: t ? Math.floor(Math.random() * 100) + 1 : 70,
    debug: { mode: "fake", prompt: t },
  };
}
