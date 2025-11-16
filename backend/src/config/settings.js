export const USE_FAKE = false;
export const PORT = Number(process.env.APP_PORT) || 4000;
export const LMSTUDIO_PORT = Number(process.env.LMSTUDIO_PORT) || 1234;

export const LMSTUDIO_URL = `http://localhost:${LMSTUDIO_PORT}/v1/chat/completions`;
export const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || "local-model";