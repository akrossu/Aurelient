// backend/src/utils/energyModel.js

// depth-scaling parameters (inspired by intelligence-per-watt scaling)
const ALPHA = 1.8;   // growth coefficient
const K = 1.35;      // non-linear exponent

// clamp helper
function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

/**
 * multiplier = 1 + α * depth^k
 * depth is in [0, 1]
 */
export function depthScalingMultiplier(depth) {
  const d = clamp01(depth);
  return 1 + ALPHA * Math.pow(d, K);
}

/**
 * depth-scaled "work" in ms.
 * we keep it in ms because that's what we actually measure.
 */
export function estimateWorkMs(runtimeMs, depth) {
  return runtimeMs * depthScalingMultiplier(depth);
}

/**
 * convert ms of work into Wh using a system wattage estimate.
 */
export function estimateEnergyWh(workMs, systemWattEstimate = 45) {
  return (systemWattEstimate * workMs) / 3_600_000;
}