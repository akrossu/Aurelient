// backend/src/config/energy.js

// estimated compute cost for Llama 3.1 8B Instruct
// rough FLOP count per generated token (forward + sampling)
export const MODEL_FLOPS_PER_TOKEN = 24e9;   // 24 GFLOPs/token

// assumed system efficiency
// 20 GFLOPs per Joule ~= laptop CPU/GPU region
export const HW_FLOPS_PER_JOULE = 20e9;      // 20 GFLOPs / Joule