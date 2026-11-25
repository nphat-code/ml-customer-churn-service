import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react'
import type { InspectedCustomer } from '../App'
import { CUSTOMER_PRESETS } from '../data/presets'
import { predictSingleCustomer } from '../services/api'
import type {
  ChurnPredictionResponse,
  ContractOption,
  CustomerInput,
  InternetAddonOption,
  InternetServiceOption,
  MultipleLinesOption,
  PaymentMethodOption,
  YesNo,
} from '../types/churn'
import { RiskGauge } from './RiskGauge'
import { XaiFactorsChart } from './XaiFactorsChart'

const DEFAULT_CUSTOMER = CUSTOMER_PRESETS[0].data

const selectClass =
  'w-full rounded-lg border border-white/10 bg-[#0d0e11] px-3 py-2 text-sm text-zinc-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400'

const RISK_LABELS = {
  High: 'Rủi ro cao',
  Medium: 'Rủi ro trung bình',
  Low: 'Rủi ro thấp',
}

interface SinglePredictorProps {
  inspectedCustomer?: InspectedCustomer | null
  onClearInspected?: () => void
}

export function SinglePredictor({
  inspectedCustomer = null,
  onClearInspected,
}: SinglePredictorProps) {
  const [customer, setCustomer] = useState<CustomerInput>(DEFAULT_CUSTOMER)
  const [activePresetId, setActivePresetId] = useState<string>(CUSTOMER_PRESETS[0].id)
  const [prediction, setPrediction] = useState<ChurnPredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [simCustomer, setSimCustomer] = useState<CustomerInput>(DEFAULT_CUSTOMER)
  const [simPrediction, setSimPrediction] = useState<ChurnPredictionResponse | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  async function runPrediction(payload: CustomerInput) {
    setLoading(true)
    setError(null)
    try {
      const result = await predictSingleCustomer(payload)
      setPrediction(result)
      setSimCustomer(payload)
      setSimPrediction(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể kết nối tới API')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (inspectedCustomer) {
      setActivePresetId('')
      setCustomer(inspectedCustomer.data)
      void runPrediction(inspectedCustomer.data)
      return
    }
    void runPrediction(DEFAULT_CUSTOMER)
  }, [inspectedCustomer])

  function handlePresetClick(presetId: string) {
    const found = CUSTOMER_PRESETS.find((item) => item.id === presetId)
    if (!found) return
    onClearInspected?.()
    setActivePresetId(found.id)
    setCustomer(found.data)
    void runPrediction(found.data)
  }

  function updateField<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    onClearInspected?.()
    setActivePresetId('')
    setCustomer((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'InternetService' && value === 'No') {
        next.OnlineSecurity = 'No internet service'
        next.OnlineBackup = 'No internet service'
        next.DeviceProtection = 'No internet service'
        next.TechSupport = 'No internet service'
        next.StreamingTV = 'No internet service'
        next.StreamingMovies = 'No internet service'
      } else if (
        key === 'InternetService' &&
        value !== 'No' &&
        prev.InternetService === 'No'
      ) {
        next.OnlineSecurity = 'No'
        next.OnlineBackup = 'No'
        next.DeviceProtection = 'No'
        next.TechSupport = 'No'
        next.StreamingTV = 'No'
        next.StreamingMovies = 'No'
      }
      if (key === 'PhoneService' && value === 'No') {
        next.MultipleLines = 'No phone service'
      } else if (key === 'PhoneService' && value === 'Yes' && prev.PhoneService === 'No') {
        next.MultipleLines = 'No'
      }
      if (key === 'tenure' || key === 'MonthlyCharges') {
        const t = key === 'tenure' ? Number(value) : prev.tenure
        const m = key === 'MonthlyCharges' ? Number(value) : prev.MonthlyCharges
        next.TotalCharges = Math.round(t * m * 100) / 100
      }
      return next
    })
  }

  async function updateSimulation<K extends keyof CustomerInput>(
    key: K,
    value: CustomerInput[K],
  ) {
    const nextSim = { ...simCustomer, [key]: value }
    if (key === 'tenure' || key === 'MonthlyCharges') {
      const t = key === 'tenure' ? Number(value) : simCustomer.tenure
      const m = key === 'MonthlyCharges' ? Number(value) : simCustomer.MonthlyCharges
      nextSim.TotalCharges = Math.round(t * m * 100) / 100
    }
    setSimCustomer(nextSim)
    setSimLoading(true)
    try {
      const result = await predictSingleCustomer(nextSim)
      setSimPrediction(result)
    } catch {
      setSimPrediction(null)
    } finally {
      setSimLoading(false)
    }
  }

  const baseProb = prediction?.churn_probability ?? 0
  const simProb = simPrediction?.churn_probability ?? baseProb
  const deltaPercent = ((simProb - baseProb) * 100).toFixed(1)
  const deltaNum = Number(deltaPercent)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/8 bg-[#131418] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-zinc-100">
              Hồ sơ khách hàng mẫu
            </span>
            {inspectedCustomer && (
              <span className="rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 font-mono text-xs text-sky-300">
                Đang xem: {inspectedCustomer.id}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400">Chọn nhanh để kiểm thử</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CUSTOMER_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id)}
                className={`rounded-xl border p-3.5 text-left transition-colors duration-150 ${
                  isSelected
                    ? 'border-sky-400/50 bg-[#1a1d24]'
                    : 'border-white/8 bg-[#0d0e11] hover:border-white/15 hover:bg-[#16181d]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-100">{preset.name}</span>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      preset.tag === 'High Risk'
                        ? 'bg-rose-400'
                        : preset.tag === 'Medium Risk'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 rounded-2xl border border-white/8 bg-[#131418] p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <h2 className="text-base font-semibold text-zinc-100">Thông số khách hàng</h2>
            <button
              type="button"
              onClick={() => void runPrediction(customer)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors duration-150 hover:bg-white disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Activity className="h-4 w-4" strokeWidth={1.5} />
              )}
              Phân tích rủi ro
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-xs font-medium text-zinc-400">
                Nhân khẩu học &amp; Gắn bó
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Giới tính</label>
                  <select
                    className={selectClass}
                    value={customer.gender}
                    onChange={(e) => updateField('gender', e.target.value as 'Male' | 'Female')}
                  >
                    <option value="Female">Nữ</option>
                    <option value="Male">Nam</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Khách hàng cao tuổi</label>
                  <select
                    className={selectClass}
                    value={customer.SeniorCitizen}
                    onChange={(e) => updateField('SeniorCitizen', Number(e.target.value))}
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Có bạn đời / gia đình</label>
                  <select
                    className={selectClass}
                    value={customer.Partner}
                    onChange={(e) => updateField('Partner', e.target.value as YesNo)}
                  >
                    <option value="Yes">Có</option>
                    <option value="No">Không</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Người phụ thuộc</label>
                  <select
                    className={selectClass}
                    value={customer.Dependents}
                    onChange={(e) => updateField('Dependents', e.target.value as YesNo)}
                  >
                    <option value="Yes">Có</option>
                    <option value="No">Không</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 pt-4">
              <h3 className="mb-3 text-xs font-medium text-zinc-400">
                Hợp đồng &amp; Cước phí
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">
                    Số tháng gắn bó:{' '}
                    <span className="font-mono font-medium text-zinc-100 tabular-nums">
                      {customer.tenure}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={72}
                    value={customer.tenure}
                    onChange={(e) => updateField('tenure', Number(e.target.value))}
                    className="mt-2 w-full accent-sky-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">
                    Cước tháng:{' '}
                    <span className="font-mono font-medium text-zinc-100 tabular-nums">
                      ${customer.MonthlyCharges.toFixed(1)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={120}
                    step={0.5}
                    value={customer.MonthlyCharges}
                    onChange={(e) => updateField('MonthlyCharges', Number(e.target.value))}
                    className="mt-2 w-full accent-sky-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Tổng cước ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={customer.TotalCharges}
                    onChange={(e) => updateField('TotalCharges', Math.max(0, Number(e.target.value)))}
                    className={`${selectClass} font-mono tabular-nums`}
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Loại hợp đồng</label>
                  <select
                    className={selectClass}
                    value={customer.Contract}
                    onChange={(e) => updateField('Contract', e.target.value as ContractOption)}
                  >
                    <option value="Month-to-month">Theo tháng</option>
                    <option value="One year">1 năm</option>
                    <option value="Two year">2 năm</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Thanh toán</label>
                  <select
                    className={selectClass}
                    value={customer.PaymentMethod}
                    onChange={(e) => updateField('PaymentMethod', e.target.value as PaymentMethodOption)}
                  >
                    <option value="Electronic check">Ví / Séc điện tử</option>
                    <option value="Mailed check">Séc bưu điện</option>
                    <option value="Bank transfer (automatic)">Chuyển khoản tự động</option>
                    <option value="Credit card (automatic)">Thẻ tín dụng tự động</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Hóa đơn điện tử</label>
                  <select
                    className={selectClass}
                    value={customer.PaperlessBilling}
                    onChange={(e) => updateField('PaperlessBilling', e.target.value as YesNo)}
                  >
                    <option value="Yes">Có</option>
                    <option value="No">Không</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 pt-4">
              <h3 className="mb-3 text-xs font-medium text-zinc-400">
                Dịch vụ Viễn thông &amp; Tiện ích
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Dịch vụ thoại</label>
                  <select
                    className={selectClass}
                    value={customer.PhoneService}
                    onChange={(e) => updateField('PhoneService', e.target.value as YesNo)}
                  >
                    <option value="Yes">Có</option>
                    <option value="No">Không</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Đa đường dây</label>
                  <select
                    className={selectClass}
                    value={customer.MultipleLines}
                    disabled={customer.PhoneService === 'No'}
                    onChange={(e) =>
                      updateField('MultipleLines', e.target.value as MultipleLinesOption)
                    }
                  >
                    <option value="No">Không</option>
                    <option value="Yes">Có</option>
                    <option value="No phone service">Không dùng thoại</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-zinc-400">Dịch vụ Internet</label>
                  <select
                    className={selectClass}
                    value={customer.InternetService}
                    onChange={(e) =>
                      updateField('InternetService', e.target.value as InternetServiceOption)
                    }
                  >
                    <option value="Fiber optic">Cáp quang</option>
                    <option value="DSL">Cáp đồng DSL</option>
                    <option value="No">Không dùng</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['OnlineSecurity', 'Bảo mật trực tuyến'],
                    ['OnlineBackup', 'Sao lưu trực tuyến'],
                    ['DeviceProtection', 'Bảo vệ thiết bị'],
                    ['TechSupport', 'Hỗ trợ kỹ thuật'],
                    ['StreamingTV', 'Truyền hình TV'],
                    ['StreamingMovies', 'Xem phim trực tuyến'],
                  ] as const
                ).map(([fieldKey, label]) => (
                  <div key={fieldKey}>
                    <label className="mb-1.5 block text-xs text-zinc-400">{label}</label>
                    <select
                      className={selectClass}
                      value={customer[fieldKey]}
                      disabled={customer.InternetService === 'No'}
                      onChange={(e) =>
                        updateField(fieldKey, e.target.value as InternetAddonOption)
                      }
                    >
                      <option value="No">Không</option>
                      <option value="Yes">Có</option>
                      <option value="No internet service">Không dùng Internet</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">
              Không thể kết nối máy chủ dự đoán: {error}. Vui lòng kiểm tra lại kết nối.
            </div>
          )}

          {prediction && (
            <>
              <RiskGauge
                probability={prediction.churn_probability}
                riskLevel={prediction.risk_level}
                prediction={prediction.churn_prediction}
              />

              <div className="rounded-2xl border border-white/8 bg-[#131418] p-5">
                <div className="mb-2 flex items-center gap-2">
                  {prediction.risk_level === 'Low' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                  )}
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Kế hoạch giữ chân đề xuất
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {prediction.recommendation}
                </p>
              </div>

              <XaiFactorsChart factors={prediction.top_factors} />
            </>
          )}
        </div>
      </div>

      {prediction && (
        <div className="rounded-2xl border border-white/8 bg-[#131418] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1c22] text-zinc-200">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Mô phỏng kịch bản giữ chân
                </h3>
                <p className="text-xs text-zinc-400">
                  Điều chỉnh hợp đồng, dịch vụ hỗ trợ hoặc mức cước để kiểm tra mức giảm rủi ro theo thời gian thực.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimCustomer(customer)
                setSimPrediction(prediction)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d0e11] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-white/20 hover:text-zinc-100"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
              Đặt lại theo gốc
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">Thử đổi hợp đồng</label>
                <select
                  className={selectClass}
                  value={simCustomer.Contract}
                  onChange={(e) => void updateSimulation('Contract', e.target.value as ContractOption)}
                >
                  <option value="Month-to-month">Theo tháng</option>
                  <option value="One year">1 năm</option>
                  <option value="Two year">2 năm</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">Thử đổi thanh toán</label>
                <select
                  className={selectClass}
                  value={simCustomer.PaymentMethod}
                  onChange={(e) =>
                    void updateSimulation('PaymentMethod', e.target.value as PaymentMethodOption)
                  }
                >
                  <option value="Electronic check">Ví / Séc điện tử</option>
                  <option value="Mailed check">Séc bưu điện</option>
                  <option value="Bank transfer (automatic)">Chuyển khoản tự động</option>
                  <option value="Credit card (automatic)">Thẻ tín dụng tự động</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">Tặng hỗ trợ kỹ thuật</label>
                <select
                  className={selectClass}
                  value={simCustomer.TechSupport}
                  disabled={simCustomer.InternetService === 'No'}
                  onChange={(e) =>
                    void updateSimulation('TechSupport', e.target.value as InternetAddonOption)
                  }
                >
                  <option value="No">Không</option>
                  <option value="Yes">Có</option>
                  <option value="No internet service">Không dùng Internet</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-400">Tặng bảo mật trực tuyến</label>
                <select
                  className={selectClass}
                  value={simCustomer.OnlineSecurity}
                  disabled={simCustomer.InternetService === 'No'}
                  onChange={(e) =>
                    void updateSimulation('OnlineSecurity', e.target.value as InternetAddonOption)
                  }
                >
                  <option value="No">Không</option>
                  <option value="Yes">Có</option>
                  <option value="No internet service">Không dùng Internet</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-zinc-400">
                  Điều chỉnh cước tháng:{' '}
                  <span className="font-mono font-medium text-zinc-100 tabular-nums">
                    ${simCustomer.MonthlyCharges.toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min={18}
                  max={120}
                  step={0.5}
                  value={simCustomer.MonthlyCharges}
                  onChange={(e) =>
                    void updateSimulation('MonthlyCharges', Number(e.target.value))
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-white/8 bg-[#0d0e11] p-5 lg:col-span-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-zinc-400">Hiện tại</div>
                  <div className="mt-1 text-2xl font-semibold text-zinc-300 tabular-nums">
                    {(baseProb * 100).toFixed(1)}%
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-zinc-400">Sau can thiệp</div>
                  <div className="mt-1 text-2xl font-semibold text-zinc-100 tabular-nums">
                    {simLoading ? '...' : `${(simProb * 100).toFixed(1)}%`}
                  </div>
                </div>
                <div
                  className={`rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
                    deltaNum < 0
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                      : deltaNum > 0
                        ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
                        : 'border-white/10 bg-[#16181d] text-zinc-300'
                  }`}
                >
                  {deltaNum > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                </div>
              </div>
              {simPrediction && (
                <p className="mt-3 text-xs text-zinc-400">
                  Mức độ sau mô phỏng:{' '}
                  <span className="font-medium text-zinc-200">
                    {RISK_LABELS[simPrediction.risk_level]}
                  </span>{' '}
                  ·{' '}
                  {simPrediction.churn_prediction === 'Churn'
                    ? 'Vẫn cần chăm sóc'
                    : 'Ổn định'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
