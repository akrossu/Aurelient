import { useDebugClass } from "@/utils/debugStyles"
import { Info } from "lucide-react"
import type { Message } from "@/types/Message"

interface TechnicalDetailsProps {
  tuning?: any
  metrics?: Message["metrics"]
}

export default function TechnicalDetails({ tuning, metrics }: TechnicalDetailsProps) {
  if (!tuning && !metrics) return null
  const detailsDebug = useDebugClass("border-green-500")
  const sectionDebug = useDebugClass("border-blue-500")
  const metricDebug = useDebugClass("border-yellow-500")
  

  return (
    <details className={`mt-2 text-xs opacity-80 ${detailsDebug}`}>
      <summary className="cursor-pointer select-none">
        technical details
      </summary>

      <div className={`mt-2 p-3 bg-black/30 rounded-xl border border-white/10 space-y-3 ${sectionDebug}`}>

        {/* TUNING PARAMETERS */}
        {tuning && (
          <section className="space-y-1">
            <div className="text-gray-400 font-semibold text-[11px]">
              tuning parameters
            </div>

            <pre className="p-2 bg-black/20 rounded border border-white/10 text-[11px] overflow-x-auto">
              {JSON.stringify(tuning, null, 2)}
            </pre>
          </section>
        )}

        {/* METRICS */}
        {metrics && (
          <section className="space-y-1">
            <div className={`text-gray-400 font-semibold text-[11px] ${metricDebug}`}>
              response metrics
            </div>

            <Metric label="runtime" value={metrics.runtimeMs} unit="ms" />
            <Metric label="tokens" value={metrics.tokens} />
            <Metric label="depth used" value={metrics.depthUsed} />

            {/* estimated energy w/ tooltip */}
            <div className="relative group">
              <div className="flex justify-between text-[11px] items-center">
                <span className="text-gray-400 flex items-center gap-1">
                  estimated energy

                  <Info
                    size={12}
                    className="text-gray-500 group-hover:text-gray-300 transition-colors cursor-help"
                  />
                </span>

                <span className="text-gray-200 tabular-nums">
                  {Number(metrics.estimatedEnergyWh.toFixed(4))} Wh
                </span>
              </div>

              <div
                className="
                  absolute left-0 top-5 z-50
                  hidden group-hover:block
                  w-56
                  bg-black/80 backdrop-blur-sm
                  border border-white/10
                  text-[11px] text-gray-200
                  p-2 rounded shadow-xl
                "
              >
                Estimated using FLOPs-per-token and hardware FLOPs-per-Joule
                from the Intelligence-Per-Watt model. Higher inference depth
                increases computational cost linearly.
              </div>
            </div>

            {metrics.efficiencyTokensPerWh !== null && (
              <Metric
                label="efficiency"
                value={metrics.efficiencyTokensPerWh}
                unit="tokens/Wh"
              />
            )}
          </section>
        )}
      </div>
    </details>
  )
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: number | string
  unit?: string
}) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-400">{label}</span>

      <span className="text-gray-200 tabular-nums">
        {typeof value === "number"
          ? Number(value.toFixed(2))
          : value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  )
}