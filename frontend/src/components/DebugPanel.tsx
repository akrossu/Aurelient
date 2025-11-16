// src/components/DebugPanel.tsx
import { useDebugClass } from "@/utils/debugStyles"
import type { InferencePrediction } from "@/services/predictionApi"

export interface PredictionDebugInfo {
  mode?: "fake" | "real"
  prompt?: string
  rawModelContent?: any
  parsed?: any
}

interface DebugPanelProps {
  debug: PredictionDebugInfo | null
  inferenceDepth: number
  prediction: InferencePrediction
  isDefault?: boolean
}

export default function DebugPanel({
  debug,
  inferenceDepth,
  prediction,
  isDefault,
}: DebugPanelProps) {
  if (!debug) return null
  const panelDebug = useDebugClass("border-red-500")
  const sectionDebug = useDebugClass("border-green-500")

  return (
    <div
      className={`
        fixed left-4 top-20 w-80
        bg-[#15171a] text-gray-200
        border border-white/10
        rounded-xl shadow-lg p-4 z-50
        overflow-y-auto max-h-[70vh]
        ${panelDebug}
      `}
    >
      <h2 className={`text-sm font-semibold mb-3 text-gray-300 ${sectionDebug}`}>Debug Panel</h2>

      <div className="text-xs space-y-3">
        {/* PROMPT */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">Prompt</div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.prompt || "(none)"}
          </pre>
        </div>

        {/* RAW MODEL OUTPUT */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">
            Raw Model Output
          </div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.rawModelContent
              ? JSON.stringify(debug.rawModelContent, null, 2)
              : "[NONE]"}
          </pre>
        </div>

        {/* PARSED RESULT */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">Parsed Result</div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.parsed
              ? JSON.stringify(debug.parsed, null, 2)
              : "[NONE]"}
          </pre>
        </div>

        {/* FINAL PREDICTION */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">
            Final Prediction Passed to UI
          </div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {isDefault
              ? "(no active prediction — using fallback defaults)"
              : JSON.stringify(prediction, null, 2)}
          </pre>
        </div>

        {/* INFERENCE DEPTH */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">
            inferenceDepth
          </div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {inferenceDepth.toFixed(4)}
          </pre>
        </div>
      </div>
    </div>
  )
}