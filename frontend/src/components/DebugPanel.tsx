import type { InferencePrediction } from '@/services/predictionApi'

export interface PredictionDebugInfo {
  mode?: 'fake' | 'real'
  prompt?: string
  rawModelContent?: any
  parsed?: any
}

interface DebugPanelProps {
  debug: PredictionDebugInfo | null
  inferenceDepth: number
  prediction: InferencePrediction
}

export default function DebugPanel({
  debug,
  inferenceDepth,
  prediction,
}: DebugPanelProps) {
  if (!debug) return null

  return (
    <div
      className="
        fixed left-4 top-20 w-80      /* <-- moved to left */
        bg-[#15171a] text-gray-200
        border border-white/10
        rounded-xl shadow-lg p-4 z-50
        overflow-y-auto max-h-[70vh]
      "
    >
      <h2 className="text-sm font-semibold mb-3 text-gray-300">
        Debug Panel
      </h2>

      <div className="text-xs space-y-3">

        <div>
          <div className="font-semibold text-gray-400 mb-1">Prompt</div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.prompt || '(none)'}
          </pre>
        </div>

        <div>
          <div className="font-semibold text-gray-400 mb-1">Raw Model Output</div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.rawModelContent
              ? JSON.stringify(debug.rawModelContent, null, 2)
              : '(fake or missing)'}
          </pre>
        </div>

        <div>
          <div className="font-semibold text-gray-400 mb-1">Parsed Result</div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {debug.parsed
              ? JSON.stringify(debug.parsed, null, 2)
              : '(fake or missing)'}
          </pre>
        </div>

        <div>
          <div className="font-semibold text-gray-400 mb-1">
            Final Prediction Passed to UI
          </div>
          <pre className="whitespace-pre-wrap bg-black/20 p-2 rounded">
            {JSON.stringify(prediction, null, 2)}
          </pre>
        </div>

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
