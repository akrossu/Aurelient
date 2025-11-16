import { useDebugClass } from "@/utils/debugStyles"
import { useMemo, useRef, useCallback } from 'react'

interface GaussianCurveProps {
  width?: number
  height?: number
  mean: number
  sigma: number
  value: number
  onChange?: (value: number) => void
  onUserControlStart?: () => void
  onUserControlEnd?: () => void
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export default function GaussianCurve({
  width = 420,
  height = 80,
  mean,
  sigma,
  value,
  onChange,
  onUserControlStart,
  onUserControlEnd,
}: GaussianCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const wrapDebug = useDebugClass("border-red-500")
  const cardDebug = useDebugClass("border-green-500")
  const svgDebug = useDebugClass("border-blue-500")

  const gaussian = useCallback(
    (x: number) => {
      const safeSigma = Math.max(sigma, 0.0001)
      return Math.exp(-((x - mean) ** 2) / (2 * safeSigma * safeSigma))
    },
    [mean, sigma],
  )

  const points = useMemo(() => {
    const max = gaussian(mean) || 1
    const arr: [number, number][] = []
    for (let i = 0; i < width; i++) {
      const xNorm = i / width
      const y = gaussian(xNorm)
      const yPix = height - (y / max) * (height * 0.85)
      arr.push([i, yPix])
    }
    return arr
  }, [gaussian, width, height, mean])

  const knobX = clamp01(value) * width
  const knobY = points[Math.floor(knobX)]?.[1] ?? height / 2

  const handleDrag = (clientX: number) => {
    if (!svgRef.current || !onChange) return
    const rect = svgRef.current.getBoundingClientRect()
    const relative = clamp01((clientX - rect.left) / rect.width) - 0.001
    onChange(clamp01(relative))
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    onUserControlStart?.()
    handleDrag(e.clientX)
    const move = (ev: MouseEvent) => handleDrag(ev.clientX)
    const up = () => {
      onUserControlEnd?.()
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  // this was pure chat ngl
  return (
    <div className={`w-full flex justify-center ${wrapDebug}`}>
      <div
        className={`
          rounded-xl px-3 py-3
          bg-[#0d1014]/90 border border-white/10
          backdrop-blur-md shadow-[0_8px_22px_rgba(0,0,0,0.3)]
          ${cardDebug}
        `}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className={`cursor-pointer select-none ${svgDebug}`}
          onMouseDown={handleMouseDown}
        >
          <defs>
            {/* brighter gradient */}
            <linearGradient id="effort-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#4f8bff" />
              <stop offset="45%" stopColor="#ffdd55" />
              <stop offset="100%" stopColor="#ff4a4a" />
            </linearGradient>

            {/* animated shimmer mask */}
            <linearGradient id="shimmer" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.35">
                <animate
                  attributeName="offset"
                  values="0;1;0"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* blur filter for glow */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* soft bloom underlay */}
          <path
            d={`M 0 ${height} ${points
              .map(([x, y]) => `L ${x} ${y}`)
              .join(' ')} L ${width} ${height} Z`}
            fill="url(#effort-grad)"
            opacity={0.22}
            filter="url(#glow)"
          />

          {/* animated shimmer overlay */}
          <path
            d={`M 0 ${height} ${points
              .map(([x, y]) => `L ${x} ${y}`)
              .join(' ')} L ${width} ${height} Z`}
            fill="url(#shimmer)"
            opacity={0.25}
          />

          {/* main bright curve line */}
          <polyline
            points={points.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="url(#effort-grad)"
            strokeWidth={2}
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* knob */}
          <circle
            cx={knobX}
            cy={knobY}
            r={9}
            fill="white"
            stroke="url(#effort-grad)"
            strokeWidth={3}
            style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.55))' }}
          />
        </svg>
      </div>
    </div>
  )
}
