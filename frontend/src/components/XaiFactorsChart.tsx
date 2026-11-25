import { ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react'
import type { FeatureContribution } from '../types/churn'

interface XaiFactorsChartProps {
  factors: FeatureContribution[]
}

const FEATURE_LABELS: Record<string, string> = {
  Contract: 'Loại hợp đồng',
  tenure: 'Số tháng gắn bó',
  OnlineSecurity: 'Bảo mật trực tuyến',
  TechSupport: 'Hỗ trợ kỹ thuật',
  InternetService: 'Dịch vụ Internet',
  PaymentMethod: 'Phương thức thanh toán',
  MonthlyCharges: 'Cước hàng tháng',
  TotalCharges: 'Tổng cước tích lũy',
  PaperlessBilling: 'Hóa đơn điện tử',
  OnlineBackup: 'Sao lưu trực tuyến',
  DeviceProtection: 'Bảo vệ thiết bị',
  StreamingTV: 'Truyền hình TV',
  StreamingMovies: 'Xem phim trực tuyến',
  MultipleLines: 'Đa đường dây',
  PhoneService: 'Dịch vụ thoại',
  Partner: 'Có bạn đời/vợ chồng',
  Dependents: 'Có người phụ thuộc',
  SeniorCitizen: 'Khách hàng cao tuổi',
  gender: 'Giới tính',
}

export function XaiFactorsChart({ factors }: XaiFactorsChartProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
        Chưa có dữ liệu giải thích SHAP cho dự đoán này.
      </div>
    )
  }

  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.1)

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Giải thích AI (SHAP Feature Impact)
          </h3>
        </div>
        <span className="text-xs text-slate-400">Top {factors.length} yếu tố ảnh hưởng</span>
      </div>

      <div className="space-y-3">
        {factors.map((factor) => {
          const isIncrease = factor.direction === 'increase'
          const widthPct = Math.max(8, Math.round((Math.abs(factor.impact) / maxImpact) * 100))
          const label = FEATURE_LABELS[factor.feature] ?? factor.feature

          return (
            <div key={factor.feature} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  {isIncrease ? (
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  )}
                  <span className="font-medium text-slate-200">{label}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300">
                    {factor.value}
                  </span>
                </div>
                <span
                  className={`font-mono font-semibold ${
                    isIncrease ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {factor.impact > 0 ? `+${factor.impact.toFixed(3)}` : factor.impact.toFixed(3)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isIncrease ? 'bg-rose-500/85' : 'bg-emerald-500/85'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Đẩy tăng nguy cơ Churn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Giúp giữ chân khách hàng
        </span>
      </div>
    </div>
  )
}
