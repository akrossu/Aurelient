export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  tuning?: {
    temperature: number
    topP: number
    maxTokens: number
    systemRole: string
  }
}