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
  High: '#f43f5e',
  Medium: '#f59e0b',
  Low: '#10b981',
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">
            Dự đoán Hàng loạt & Phân tích Tập khách hàng (CSV Batch)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Tải lên file CSV chuẩn Telco Customer Churn (tối đa 200 dòng/lượt) hoặc dùng bộ dữ liệu mẫu để gọi API{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-300">
              /api/v1/predict/batch
            </code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSampleBatch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Chạy thử 16 khách hàng mẫu
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500">
            <Upload className="h-4 w-4 text-indigo-400" />
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
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center">
          <FileSpreadsheet className="h-10 w-10 text-slate-500" />
          <p className="mt-3 text-sm font-medium text-slate-300">
            Chưa có dữ liệu batch nào được phân tích
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Nhấn &ldquo;Chạy thử 16 khách hàng mẫu&rdquo; hoặc tải file CSV để xem biểu đồ phân bố rủi ro.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs text-slate-400">Tổng khách hàng</div>
              <div className="mt-1 text-2xl font-bold text-white">{total}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs text-slate-400">Dự đoán Rời bỏ (Churn)</div>
              <div className="mt-1 text-2xl font-bold text-rose-400">
                {churnCount}{' '}
                <span className="text-sm font-normal text-slate-400">
                  ({Math.round((churnCount / total) * 100)}%)
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs text-slate-400">Nhóm Rủi ro Cao (High Risk)</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">{highCount}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-xs text-slate-400">Xác suất Churn trung bình</div>
              <div className="mt-1 text-2xl font-bold text-indigo-300">
                {(avgProb * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Phân bố Tầng Rủi ro</h3>
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
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> High ({highCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium ({mediumCount})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low ({lowCount})
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">
                  Danh sách Khách hàng (Sắp xếp theo rủi ro giảm dần)
                </h3>
                <div className="flex gap-1.5">
                  {(['ALL', 'High', 'Medium', 'Low'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setRiskFilter(tier)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        riskFilter === tier
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tier === 'ALL' ? 'Tất cả' : tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-80 overflow-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5">Mã KH</th>
                      <th className="px-3 py-2.5">Hợp đồng</th>
                      <th className="px-3 py-2.5">Tháng</th>
                      <th className="px-3 py-2.5">Cước/tháng</th>
                      <th className="px-3 py-2.5">Xác suất</th>
                      <th className="px-3 py-2.5">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2 font-mono text-indigo-300">{row.id}</td>
                        <td className="px-3 py-2">{row.input.Contract}</td>
                        <td className="px-3 py-2">{row.input.tenure}</td>
                        <td className="px-3 py-2">${row.input.MonthlyCharges.toFixed(1)}</td>
                        <td className="px-3 py-2 font-semibold">
                          {(row.result.churn_probability * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              row.result.risk_level === 'High'
                                ? 'bg-rose-500/20 text-rose-300'
                                : row.result.risk_level === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
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
