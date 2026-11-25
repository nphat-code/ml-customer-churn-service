import { useEffect, useState } from 'react'
import { BarChart3, Layers, RefreshCw, ShieldCheck } from 'lucide-react'
import { BatchDashboard } from './components/BatchDashboard'
import { SinglePredictor } from './components/SinglePredictor'
import { fetchHealth } from './services/api'
import type { HealthResponse } from './types/churn'

type ActiveTab = 'single' | 'batch'

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('single')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [checkingHealth, setCheckingHealth] = useState(false)

  async function checkApiHealth() {
    setCheckingHealth(true)
    try {
      const data = await fetchHealth()
      setHealth(data)
    } catch {
      setHealth(null)
    } finally {
      setCheckingHealth(false)
    }
  }

  useEffect(() => {
    void checkApiHealth()
  }, [])

  const isHealthy = health?.status === 'healthy' && health.model_loaded

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                ChurnGuard AI
              </h1>
              <p className="text-xs text-slate-400">
                Telco Customer Retention & Explainable ML Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'single'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Phân tích & What-If
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'batch'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Batch CSV
              </button>
            </div>

            <button
              type="button"
              onClick={() => void checkApiHealth()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
              <span>{isHealthy ? health.model_version : 'API Offline'}</span>
              <RefreshCw className={`h-3 w-3 text-slate-400 ${checkingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'single' ? <SinglePredictor /> : <BatchDashboard />}
      </main>
    </div>
  )
}

export default App
