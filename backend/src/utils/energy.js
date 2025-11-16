// backend/src/utils/energy.js

import {
  MODEL_FLOPS_PER_TOKEN,
  HW_FLOPS_PER_JOULE
} from "../config/energy.js"

/**
 * FLOPs required for generation
 */
export function computeWork(tokens) {
  return tokens * MODEL_FLOPS_PER_TOKEN
}

/**
 * Convert FLOPs -> watt-hours
 */
function flopsToWh(f) {
  return (f / HW_FLOPS_PER_JOULE) / 3600
}


export function computeEnergyMetrics({ tokens, depth, runtimeMs }) {
  const depthClamped = Math.min(1, Math.max(0, depth))

  // FLOPs are scaled by depth (inference depth selects % of FLOPs).
  const fullFlops = computeWork(tokens)
  const actualFlops = fullFlops * depthClamped

  const estimatedEnergyWh = flopsToWh(actualFlops)
  const efficiency = estimatedEnergyWh > 0
    ? tokens / estimatedEnergyWh
    : null

  return {
    tokens,
    depthUsed: depthClamped,
    estimatedEnergyWh,
    efficiencyTokensPerWh: efficiency,
    runtimeMs
  }
}