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
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export function SinglePredictor() {
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
    void runPrediction(DEFAULT_CUSTOMER)
  }, [])

  function handlePresetClick(presetId: string) {
    const found = CUSTOMER_PRESETS.find((item) => item.id === presetId)
    if (!found) return
    setActivePresetId(found.id)
    setCustomer(found.data)
    void runPrediction(found.data)
  }

  function updateField<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
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
  const deltaPercent = Math.round((simProb - baseProb) * 1000) / 10

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">
              Hồ sơ mẫu 1-Click (Preset Profiles)
            </span>
          </div>
          <span className="text-xs text-slate-400">Chọn nhanh để kiểm thử tức thì</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CUSTOMER_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/15 shadow-sm shadow-indigo-500/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{preset.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      preset.tag === 'High Risk'
                        ? 'bg-rose-500/20 text-rose-300'
                        : preset.tag === 'Medium Risk'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {preset.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Thông số Khách hàng</h2>
            <button
              type="button"
              onClick={() => void runPrediction(customer)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Phân tích Churn
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                1. Nhân khẩu học & Gắn bó
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Giới tính</label>
                  <select
                    className={selectClass}
                    value={customer.gender}
                    onChange={(e) => updateField('gender', e.target.value as 'Male' | 'Female')}
                  >
                    <option value="Female">Female (Nữ)</option>
                    <option value="Male">Male (Nam)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Khách hàng cao tuổi</label>
                  <select
                    className={selectClass}
                    value={customer.SeniorCitizen}
                    onChange={(e) => updateField('SeniorCitizen', Number(e.target.value))}
                  >
                    <option value={0}>Không (0)</option>
                    <option value={1}>Có (1)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Có bạn đời (Partner)</label>
                  <select
                    className={selectClass}
                    value={customer.Partner}
                    onChange={(e) => updateField('Partner', e.target.value as YesNo)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Người phụ thuộc</label>
                  <select
                    className={selectClass}
                    value={customer.Dependents}
                    onChange={(e) => updateField('Dependents', e.target.value as YesNo)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                2. Hợp đồng & Cước phí
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Số tháng gắn bó: <span className="font-semibold text-white">{customer.tenure}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={72}
                    value={customer.tenure}
                    onChange={(e) => updateField('tenure', Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Cước tháng ($):{' '}
                    <span className="font-semibold text-white">${customer.MonthlyCharges.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min={18}
                    max={120}
                    step={0.5}
                    value={customer.MonthlyCharges}
                    onChange={(e) => updateField('MonthlyCharges', Number(e.target.value))}
                    className="mt-2 w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Tổng cước ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={customer.TotalCharges}
                    onChange={(e) => updateField('TotalCharges', Math.max(0, Number(e.target.value)))}
                    className={selectClass}
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Loại hợp đồng</label>
                  <select
                    className={selectClass}
                    value={customer.Contract}
                    onChange={(e) => updateField('Contract', e.target.value as ContractOption)}
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Thanh toán</label>
                  <select
                    className={selectClass}
                    value={customer.PaymentMethod}
                    onChange={(e) => updateField('PaymentMethod', e.target.value as PaymentMethodOption)}
                  >
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer (automatic)">Bank transfer (auto)</option>
                    <option value="Credit card (automatic)">Credit card (auto)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Hóa đơn điện tử</label>
                  <select
                    className={selectClass}
                    value={customer.PaperlessBilling}
                    onChange={(e) => updateField('PaperlessBilling', e.target.value as YesNo)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                3. Dịch vụ Viễn thông & Tiện ích
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Phone Service</label>
                  <select
                    className={selectClass}
                    value={customer.PhoneService}
                    onChange={(e) => updateField('PhoneService', e.target.value as YesNo)}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Multiple Lines</label>
                  <select
                    className={selectClass}
                    value={customer.MultipleLines}
                    disabled={customer.PhoneService === 'No'}
                    onChange={(e) =>
                      updateField('MultipleLines', e.target.value as MultipleLinesOption)
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="No phone service">No phone service</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Internet Service</label>
                  <select
                    className={selectClass}
                    value={customer.InternetService}
                    onChange={(e) =>
                      updateField('InternetService', e.target.value as InternetServiceOption)
                    }
                  >
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="DSL">DSL</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['OnlineSecurity', 'Online Security'],
                    ['OnlineBackup', 'Online Backup'],
                    ['DeviceProtection', 'Device Protection'],
                    ['TechSupport', 'Tech Support'],
                    ['StreamingTV', 'Streaming TV'],
                    ['StreamingMovies', 'Streaming Movies'],
                  ] as const
                ).map(([fieldKey, label]) => (
                  <div key={fieldKey}>
                    <label className="mb-1 block text-xs text-slate-400">{label}</label>
                    <select
                      className={selectClass}
                      value={customer[fieldKey]}
                      disabled={customer.InternetService === 'No'}
                      onChange={(e) =>
                        updateField(fieldKey, e.target.value as InternetAddonOption)
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="No internet service">No internet service</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:col-span-5">
          {error && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-200">
              Lỗi gọi API: {error}. Hãy đảm bảo FastAPI đang chạy ở cổng 8000.
            </div>
          )}

          {prediction && (
            <>
              <RiskGauge
                probability={prediction.churn_probability}
                riskLevel={prediction.risk_level}
                prediction={prediction.churn_prediction}
              />

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="mb-2 flex items-center gap-2">
                  {prediction.risk_level === 'Low' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                  )}
                  <h3 className="text-sm font-semibold text-white">
                    Khuyến nghị hành động (Retention Plan)
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {prediction.recommendation}
                </p>
              </div>

              <XaiFactorsChart factors={prediction.top_factors} />
            </>
          )}
        </div>
      </div>

      {prediction && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  What-If Simulator — Mô phỏng kịch bản giữ chân khách hàng
                </h3>
                <p className="text-xs text-slate-400">
                  Thử thay đổi gói hợp đồng, dịch vụ hỗ trợ hoặc mức cước để xem xác suất Churn thay đổi theo thời gian thực.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimCustomer(customer)
                setSimPrediction(prediction)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Đặt lại theo gốc
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Thử đổi Hợp đồng</label>
                <select
                  className={selectClass}
                  value={simCustomer.Contract}
                  onChange={(e) => void updateSimulation('Contract', e.target.value as ContractOption)}
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Thử đổi Thanh toán</label>
                <select
                  className={selectClass}
                  value={simCustomer.PaymentMethod}
                  onChange={(e) =>
                    void updateSimulation('PaymentMethod', e.target.value as PaymentMethodOption)
                  }
                >
                  <option value="Electronic check">Electronic check</option>
                  <option value="Mailed check">Mailed check</option>
                  <option value="Bank transfer (automatic)">Bank transfer (auto)</option>
                  <option value="Credit card (automatic)">Credit card (auto)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Tặng Tech Support</label>
                <select
                  className={selectClass}
                  value={simCustomer.TechSupport}
                  disabled={simCustomer.InternetService === 'No'}
                  onChange={(e) =>
                    void updateSimulation('TechSupport', e.target.value as InternetAddonOption)
                  }
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="No internet service">No internet service</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Tặng Online Security</label>
                <select
                  className={selectClass}
                  value={simCustomer.OnlineSecurity}
                  disabled={simCustomer.InternetService === 'No'}
                  onChange={(e) =>
                    void updateSimulation('OnlineSecurity', e.target.value as InternetAddonOption)
                  }
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="No internet service">No internet service</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">
                  Giảm cước tháng xuống ($):{' '}
                  <span className="font-semibold text-white">
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
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-950/70 p-4 lg:col-span-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-400">Hiện tại</div>
                  <div className="text-2xl font-bold text-slate-200">
                    {(baseProb * 100).toFixed(1)}%
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-400">Sau can thiệp</div>
                  <div className="text-2xl font-bold text-white">
                    {simLoading ? '...' : `${(simProb * 100).toFixed(1)}%`}
                  </div>
                </div>
                <div
                  className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
                    deltaPercent < 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : deltaPercent > 0
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                </div>
              </div>
              {simPrediction && (
                <p className="mt-3 text-xs text-slate-400">
                  Mức độ rủi ro sau mô phỏng:{' '}
                  <span className="font-semibold text-slate-200">{simPrediction.risk_level}</span> —{' '}
                  {simPrediction.churn_prediction}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
