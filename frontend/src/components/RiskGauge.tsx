interface RiskGaugeProps {
  probability: number
  riskLevel: 'Low' | 'Medium' | 'High'
  prediction: 'Churn' | 'Retain'
}

const RISK_STYLES = {
  High: {
    stroke: '#f43f5e',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    glow: 'shadow-rose-500/10',
    label: 'Rủi ro Cao',
  },
  Medium: {
    stroke: '#f59e0b',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    glow: 'shadow-amber-500/10',
    label: 'Rủi ro Trung bình',
  },
  Low: {
    stroke: '#10b981',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    glow: 'shadow-emerald-500/10',
    label: 'Rủi ro Thấp',
  },
}

export function RiskGauge({ probability, riskLevel, prediction }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(1, probability))
  const percent = Math.round(clamped * 1000) / 10
  const style = RISK_STYLES[riskLevel]
  const radius = 78
  const circumference = Math.PI * radius
  const dashOffset = circumference * (1 - clamped)

  return (
    <div className={`flex flex-col items-center rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg ${style.glow}`}>
      <div className="relative flex w-full max-w-[220px] flex-col items-center">
        <svg viewBox="0 0 200 115" className="w-full overflow-visible">
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke={style.stroke}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="-mt-11 text-center">
          <div className="text-3xl font-bold tracking-tight text-white">{percent}%</div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Xác suất rời bỏ
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}>
          {style.label} ({riskLevel})
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            prediction === 'Churn'
              ? 'border-rose-500/30 bg-rose-950/60 text-rose-200'
              : 'border-emerald-500/30 bg-emerald-950/60 text-emerald-200'
          }`}
        >
          Dự đoán: {prediction === 'Churn' ? 'Rời bỏ (Churn)' : 'Ở lại (Retain)'}
        </span>
      </div>
    </div>
  )
}

