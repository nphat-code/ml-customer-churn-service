import { ArrowDownRight, ArrowUpRight, BarChart2 } from 'lucide-react'
import type { FeatureContribution } from '../types/churn'

interface XaiFactorsChartProps {
  factors: FeatureContribution[]
}

const FEATURE_LABELS: Record<string, string> = {
  Contract: 'Loại hợp đồng',
  tenure: 'Thời gian gắn bó',
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

const VALUE_LABELS: Record<string, string> = {
  'Month-to-month': 'Theo tháng',
  'One year': '1 năm',
  'Two year': '2 năm',
  Yes: 'Có',
  No: 'Không',
  'No internet service': 'Không dùng Internet',
  'No phone service': 'Không dùng thoại',
  'Fiber optic': 'Cáp quang',
  'Electronic check': 'Séc/Ví điện tử',
  'Mailed check': 'Séc bưu điện',
  'Bank transfer (automatic)': 'Chuyển khoản tự động',
  'Credit card (automatic)': 'Thẻ tín dụng tự động',
  Male: 'Nam',
  Female: 'Nữ',
}

function formatFactorValue(feature: string, value: string): string {
  if (feature === 'tenure') return `${value} tháng`
  if (feature === 'MonthlyCharges' || feature === 'TotalCharges') return `$${value}`
  if (feature === 'SeniorCitizen') return value === '1' ? 'Có' : 'Không'
  return VALUE_LABELS[value] ?? value
}

export function XaiFactorsChart({ factors }: XaiFactorsChartProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-[#131418] p-5 text-sm text-zinc-400">
        Chưa có dữ liệu phân tích nguyên nhân
      </div>
    )
  }

  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.1)
  const totalImpact = factors.reduce((sum, f) => sum + Math.abs(f.impact), 0) || 1

  return (
    <div className="rounded-2xl border border-white/8 bg-[#131418] p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-zinc-100">
            Yếu tố ảnh hưởng chính
          </h3>
        </div>
        <span className="text-xs text-zinc-400 tabular-nums">
          {factors.length} yếu tố nổi bật
        </span>
      </div>

      <div className="space-y-3">
        {factors.map((factor) => {
          const isIncrease = factor.direction === 'increase'
          const widthPct = Math.max(8, Math.round((Math.abs(factor.impact) / maxImpact) * 100))
          const sharePct = Math.round((Math.abs(factor.impact) / totalImpact) * 100)
          const label = FEATURE_LABELS[factor.feature] ?? factor.feature
          const displayValue = formatFactorValue(factor.feature, factor.value)

          return (
            <div key={factor.feature} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  {isIncrease ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
                  )}
                  <span className="truncate font-medium text-zinc-200">{label}</span>
                  <span className="shrink-0 rounded bg-[#1d2027] px-1.5 py-0.5 text-[11px] text-zinc-300">
                    {displayValue}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-mono text-xs font-medium tabular-nums ${
                    isIncrease ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isIncrease ? 'Tăng' : 'Giảm'} · {sharePct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e2027]">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                    isIncrease ? 'bg-rose-400/85' : 'bg-emerald-400/85'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-xs text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Đẩy tăng nguy cơ rời bỏ
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Giúp giữ chân khách hàng
        </span>
      </div>
    </div>
  )
}
