interface RiskGaugeProps {
  probability: number
  riskLevel: 'Low' | 'Medium' | 'High'
  prediction: 'Churn' | 'Retain'
}

const RISK_STYLES = {
  High: {
    stroke: '#fb7185',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    label: 'Rủi ro cao',
  },
  Medium: {
    stroke: '#fbbf24',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    label: 'Rủi ro trung bình',
  },
  Low: {
    stroke: '#34d399',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    label: 'Rủi ro thấp',
  },
}

export function RiskGauge({ probability, riskLevel, prediction }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(1, probability))
  const percent = (clamped * 100).toFixed(1)
  const style = RISK_STYLES[riskLevel]
  const radius = 78
  const circumference = Math.PI * radius
  const dashOffset = circumference * (1 - clamped)

  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-[#131418] p-6">
      <div className="relative flex w-full max-w-[220px] flex-col items-center">
        <svg viewBox="0 0 200 115" className="w-full overflow-visible">
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="#22252c"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke={style.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>
        <div className="-mt-11 text-center">
          <div className="text-3xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {percent}%
          </div>
          <div className="mt-0.5 text-xs font-medium text-zinc-400">
            Xác suất rời bỏ
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${style.badge}`}>
          {style.label} · {riskLevel}
        </span>
        <span className="rounded-md border border-white/8 bg-[#1a1c22] px-2.5 py-1 text-xs font-medium text-zinc-300">
          {prediction === 'Churn' ? 'Dự đoán: Rời bỏ (Churn)' : 'Dự đoán: Ở lại (Retain)'}
        </span>
      </div>
    </div>
  )
}
