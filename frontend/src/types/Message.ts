import type { TuningParameters } from "./TuningParameters";

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  tuning?: TuningParameters
}