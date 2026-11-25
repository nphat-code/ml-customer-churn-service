import { useState } from 'react'
import { Database, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { buildSampleBatchCustomers } from '../data/presets'
import { predictBatchCustomers } from '../services/api'
import type { ChurnPredictionResponse, CustomerInput } from '../types/churn'

interface BatchRow {
  id: string
  input: CustomerInput
  result: ChurnPredictionResponse
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseTelcoCsv(text: string): { ids: string[]; customers: CustomerInput[] } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('File CSV cần có dòng tiêu đề và ít nhất 1 dòng dữ liệu.')
  }

  const headers = parseCsvLine(lines[0])
  const indexOf = (name: string) => headers.indexOf(name)

  const requiredCols = [
    'gender',
    'SeniorCitizen',
    'Partner',
    'Dependents',
    'tenure',
    'PhoneService',
    'MultipleLines',
    'InternetService',
    'OnlineSecurity',
    'OnlineBackup',
    'DeviceProtection',
    'TechSupport',
    'StreamingTV',
    'StreamingMovies',
    'Contract',
    'PaperlessBilling',
    'PaymentMethod',
    'MonthlyCharges',
    'TotalCharges',
  ]

  for (const col of requiredCols) {
    if (indexOf(col) === -1) {
      throw new Error(`Thiếu cột bắt buộc trong CSV: ${col}`)
    }
  }

  const idIdx = indexOf('customerID')
  const ids: string[] = []
  const customers: CustomerInput[] = []

  for (let i = 1; i < Math.min(lines.length, 201); i += 1) {
    const row = parseCsvLine(lines[i])
    if (row.length < headers.length) continue
    const get = (col: string) => row[indexOf(col)]
    const rawTotal = get('TotalCharges')
    const parsedTotal = rawTotal === '' ? 0 : Number(rawTotal)

    ids.push(idIdx >= 0 ? row[idIdx] : `CUST-${String(i).padStart(3, '0')}`)
    customers.push({
      gender: get('gender') as CustomerInput['gender'],
      SeniorCitizen: Number(get('SeniorCitizen')),
      Partner: get('Partner') as CustomerInput['Partner'],
      Dependents: get('Dependents') as CustomerInput['Dependents'],
      tenure: Number(get('tenure')),
      PhoneService: get('PhoneService') as CustomerInput['PhoneService'],
      MultipleLines: get('MultipleLines') as CustomerInput['MultipleLines'],
      InternetService: get('InternetService') as CustomerInput['InternetService'],
      OnlineSecurity: get('OnlineSecurity') as CustomerInput['OnlineSecurity'],
      OnlineBackup: get('OnlineBackup') as CustomerInput['OnlineBackup'],
      DeviceProtection: get('DeviceProtection') as CustomerInput['DeviceProtection'],
      TechSupport: get('TechSupport') as CustomerInput['TechSupport'],
      StreamingTV: get('StreamingTV') as CustomerInput['StreamingTV'],
      StreamingMovies: get('StreamingMovies') as CustomerInput['StreamingMovies'],
      Contract: get('Contract') as CustomerInput['Contract'],
      PaperlessBilling: get('PaperlessBilling') as CustomerInput['PaperlessBilling'],
      PaymentMethod: get('PaymentMethod') as CustomerInput['PaymentMethod'],
      MonthlyCharges: Number(get('MonthlyCharges')),
      TotalCharges: Number.isNaN(parsedTotal) ? 0 : parsedTotal,
    })
  }

  return { ids, customers }
}

const PIE_COLORS = {
  High: '#fb7185',
  Medium: '#fbbf24',
  Low: '#34d399',
}

export function BatchDashboard() {
  const [rows, setRows] = useState<BatchRow[]>([])
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runBatch(ids: string[], customers: CustomerInput[]) {
    setLoading(true)
    setError(null)
    try {
      const response = await predictBatchCustomers(customers)
      const merged: BatchRow[] = response.predictions.map((result, idx) => ({
        id: ids[idx] ?? `CUST-${String(idx + 1).padStart(3, '0')}`,
        input: customers[idx],
        result,
      }))
      merged.sort((a, b) => b.result.churn_probability - a.result.churn_probability)
      setRows(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi gọi API dự đoán hàng loạt')
    } finally {
      setLoading(false)
    }
  }

  function handleSampleBatch() {
    const customers = buildSampleBatchCustomers()
    const ids = customers.map((_, idx) => `DEMO-${String(idx + 1).padStart(3, '0')}`)
    void runBatch(ids, customers)
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      const { ids, customers } = parseTelcoCsv(text)
      await runBatch(ids, customers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đọc file CSV')
    }
  }

  const total = rows.length
  const churnCount = rows.filter((r) => r.result.churn_prediction === 'Churn').length
  const highCount = rows.filter((r) => r.result.risk_level === 'High').length
  const mediumCount = rows.filter((r) => r.result.risk_level === 'Medium').length
  const lowCount = rows.filter((r) => r.result.risk_level === 'Low').length
  const avgProb =
    total > 0
      ? rows.reduce((sum, r) => sum + r.result.churn_probability, 0) / total
      : 0

  const pieData = [
    { name: 'High Risk', value: highCount, color: PIE_COLORS.High },
    { name: 'Medium Risk', value: mediumCount, color: PIE_COLORS.Medium },
    { name: 'Low Risk', value: lowCount, color: PIE_COLORS.Low },
  ].filter((d) => d.value > 0)

  const filteredRows =
    riskFilter === 'ALL' ? rows : rows.filter((r) => r.result.risk_level === riskFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#131418] p-5">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Dự đoán hàng loạt &amp; Phân tích tập khách hàng (CSV Batch)
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Tải lên file CSV chuẩn Telco Customer Churn (tối đa 200 dòng/lượt) hoặc dùng bộ dữ liệu mẫu qua{' '}
            <code className="rounded bg-[#1d2027] px-1.5 py-0.5 font-mono text-zinc-200">
              /api/v1/predict/batch
            </code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSampleBatch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors duration-150 hover:bg-white disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Database className="h-4 w-4" strokeWidth={1.5} />
            )}
            Chạy thử 16 khách hàng mẫu
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0d0e11] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors duration-150 hover:border-white/20">
            <Upload className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            Tải file CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => void handleFileUpload(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#131418]/60 py-16 text-center">
          <FileSpreadsheet className="h-9 w-9 text-zinc-500" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-zinc-300">
            Chưa có dữ liệu batch nào được phân tích
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Nhấn &ldquo;Chạy thử 16 khách hàng mẫu&rdquo; hoặc tải file CSV để xem phân bố rủi ro
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/8 bg-[#131418] p-4">
              <div className="text-xs text-zinc-400">Tổng khách hàng</div>
              <div className="mt-1.5 text-2xl font-semibold text-zinc-100 tabular-nums">
                {total}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#131418] p-4">
              <div className="text-xs text-zinc-400">Dự đoán rời bỏ (Churn)</div>
              <div className="mt-1.5 text-2xl font-semibold text-rose-400 tabular-nums">
                {churnCount}{' '}
                <span className="text-xs font-normal text-zinc-400">
                  ({Math.round((churnCount / total) * 100)}%)
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#131418] p-4">
              <div className="text-xs text-zinc-400">Nhóm rủi ro cao</div>
              <div className="mt-1.5 text-2xl font-semibold text-amber-400 tabular-nums">
                {highCount}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-[#131418] p-4">
              <div className="text-xs text-zinc-400">Xác suất trung bình</div>
              <div className="mt-1.5 text-2xl font-semibold text-sky-400 tabular-nums">
                {(avgProb * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-white/8 bg-[#131418] p-5 lg:col-span-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">Phân bố tầng rủi ro</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#131418',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        color: '#f4f4f5',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs text-zinc-300 tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> High ({highCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Medium ({mediumCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Low ({lowCount})
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#131418] p-5 lg:col-span-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Danh sách khách hàng (Sắp xếp theo rủi ro giảm dần)
                </h3>
                <div className="flex gap-1.5">
                  {(['ALL', 'High', 'Medium', 'Low'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setRiskFilter(tier)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                        riskFilter === tier
                          ? 'bg-zinc-100 text-zinc-950'
                          : 'bg-[#1d2027] text-zinc-300 hover:bg-[#262a33]'
                      }`}
                    >
                      {tier === 'ALL' ? 'Tất cả' : tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-80 overflow-auto rounded-xl border border-white/8">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-white/8 bg-[#0d0e11] text-zinc-400">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Mã KH</th>
                      <th className="px-3 py-2.5 font-medium">Hợp đồng</th>
                      <th className="px-3 py-2.5 text-right font-medium">Tháng</th>
                      <th className="px-3 py-2.5 text-right font-medium">Cước/tháng</th>
                      <th className="px-3 py-2.5 text-right font-medium">Xác suất</th>
                      <th className="px-3 py-2.5 font-medium">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6 text-zinc-200">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="transition-colors duration-150 hover:bg-white/[0.03]">
                        <td className="px-3 py-2 font-mono text-zinc-300">{row.id}</td>
                        <td className="px-3 py-2">{row.input.Contract}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {row.input.tenure}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          ${row.input.MonthlyCharges.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-medium tabular-nums">
                          {(row.result.churn_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                              row.result.risk_level === 'High'
                                ? 'border-rose-500/25 bg-rose-500/10 text-rose-300'
                                : row.result.risk_level === 'Medium'
                                  ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                                  : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {row.result.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
