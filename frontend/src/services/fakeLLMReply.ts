import type { InferencePrediction } from "@/types/InferencePrediction"

export async function fakeLLMReply(
  text: string,
  depth: number,
  prediction: InferencePrediction
) {
  await new Promise(r => setTimeout(r, 120))

  return `echo  
  depth=${Math.round(depth * 100)}%  
  complexity=${Math.round(prediction.complexity)}%  
  confidence=${Math.round(prediction.confidence)}%  
  -> ${text}`
}
