import GaussianCurve from './GaussianCurve'

interface InferenceCurveContainerProps {
  visible: boolean
  mean: number
  sigma: number
  inferenceDepth: number
  setInferenceDepth: (v: number) => void
  toggle: () => void
  onControlStart: () => void
  onControlEnd: () => void
}

export default function InferenceCurveContainer({
  visible,
  mean,
  sigma,
  inferenceDepth,
  setInferenceDepth,
//   toggle,       // idk if we're gonna use this again
  onControlStart,
  onControlEnd,
}: InferenceCurveContainerProps) {
  const label = (inferenceDepth * 100).toFixed(0)

  return (
    <div
      className={`
        absolute bottom-[140px] left-1/2 -translate-x-1/2
        z-40 flex flex-col items-center
        transition-all duration-200 ease-out
        ${
          visible
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-3 scale-[0.97] pointer-events-none'
        }
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

      <div className="mt-1.5 text-[11px] text-gray-300 tracking-wide">
        inference depth:{' '}
        <span className="text-gray-50">{label}%</span>
      </div>
    </div>
  )
}
