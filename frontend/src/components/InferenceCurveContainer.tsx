// src/components/InferenceCurveContainer.tsx
import { useDebugClass } from "@/utils/debugStyles"
import GaussianCurve from './GaussianCurve'

interface InferenceCurveContainerProps {
  visible: boolean
  mean: number
  sigma: number
  inferenceDepth: number
  setInferenceDepth: (v: number) => void
  onControlStart: () => void
  onControlEnd: () => void
}

export default function InferenceCurveContainer({
  visible,
  mean,
  sigma,
  inferenceDepth,
  setInferenceDepth,
  onControlStart,
  onControlEnd,
}: InferenceCurveContainerProps) {
  const label = (inferenceDepth * 100).toFixed(0)
  const containerDebug = useDebugClass("border-purple-500")
  const labelDebug = useDebugClass("border-yellow-500")

  return (
    <div
      className={`
        fixed bottom-[92px] left-1/2 -translate-x-1/2
        z-40 flex flex-col items-center
        transition-opacity duration-200 ease-out
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        ${containerDebug}
      `}
    >
      <GaussianCurve
        width={460}
        height={72}
        mean={mean}
        sigma={sigma}
        value={inferenceDepth}
        onChange={setInferenceDepth}
        onUserControlStart={onControlStart}
        onUserControlEnd={onControlEnd}
      />

      <div className={`mt-1.5 text-[11px] text-gray-300 tracking-wide ${labelDebug}`}>
        inference depth:{' '}
        <span className="text-gray-50">{label}%</span>
      </div>
    </div>
  )
}