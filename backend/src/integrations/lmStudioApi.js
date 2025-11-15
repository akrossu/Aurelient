import { LMSTUDIO_URL, LMSTUDIO_MODEL } from "../config/settings.js";

export async function callLMStudio(body) {
  try {
    const resp = await fetch(LMSTUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return resp;
  } catch (err) {
    console.log("LM Studio request failed:", err);
    return null;
  }
}

export function buildPredictBody(prompt) {
  return {
    model: LMSTUDIO_MODEL,
    temperature: 0.1,
    max_tokens: 50,
    stream: false,
    messages: [
      {
        role: "system",
        content:
          'respond ONLY with pure JSON: {"complexity": <int(1-100)>, "confidence": <int(1-100)>}, no text, no code fences.',
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };
}
