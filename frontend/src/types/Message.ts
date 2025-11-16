export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  tuning?: any
  metrics?: {
    tokens: number
    depthUsed: number
    estimatedEnergyWh: number
    efficiencyTokensPerWh: number | null
    runtimeMs: number
  } | null
}
