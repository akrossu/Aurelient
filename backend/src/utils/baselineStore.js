// backend/src/utils/baselineStore.js

let baselineEnergyWh = null;

/**
 * return current baseline energy (Wh) for depth=1,
 * or null if not set.
 */
export function getBaselineEnergy() {
  return baselineEnergyWh;
}

/**
 * update baseline when depth is effectively 1.0.
 * we assume max-depth runs are our "full cost" reference.
 */
export function updateBaselineIfNeeded(energyWh, depthUsed) {
  if (depthUsed >= 0.99) {
    baselineEnergyWh = energyWh;
  }
}

/**
 * whether we have a baseline yet.
 */
export function hasBaseline() {
  return baselineEnergyWh !== null;
}