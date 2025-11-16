export const USE_FAKE = false;
export const PORT = Number(process.env.APP_PORT) || 4000;
export const LMSTUDIO_PORT = Number(process.env.LMSTUDIO_PORT) || 1234;

export const LMSTUDIO_URL = `http://localhost:${LMSTUDIO_PORT}/v1/chat/completions`;
export const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || "local-model";
export const PREDICTION_PROMPT = `
Score the user's prompt. Return only JSON: {"complexity": X, "confidence": Y}.

complexity (0-100): depth of reasoning required.
confidence (0-100): how clearly the prompt can be answered as written.

Rules:
- Missing context, pronouns without antecedents, vague references, or undefined terms MUST drop confidence below 20.
- Very short prompts that rely on external knowledge (“explain this”, “that makes no sense”, “help me”) also MUST be <20 confidence.
- Only specific, self-contained prompts may score above 80 confidence.
- Do not justify. Output JSON only.
`