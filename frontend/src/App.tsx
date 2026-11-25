import { useEffect, useState } from 'react'
import { BarChart3, Layers, Radio, RefreshCw } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0d0e11] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0d0e11]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#16181d] text-zinc-100">
              <Radio className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                ChurnGuard
              </h1>
              <p className="text-xs text-zinc-400">
                Telco retention &amp; churn telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex rounded-lg border border-white/8 bg-[#131418] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  activeTab === 'single'
                    ? 'bg-[#22252c] text-zinc-100 ring-1 ring-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="h-4 w-4" strokeWidth={1.5} />
                Phân tích &amp; What-If
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  activeTab === 'batch'
                    ? 'bg-[#22252c] text-zinc-100 ring-1 ring-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
                Batch CSV
              </button>
            </nav>

            <button
              type="button"
              onClick={() => void checkApiHealth()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#131418] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors duration-150 hover:border-white/15 hover:text-zinc-100"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="font-mono text-[11px] tabular-nums">
                {isHealthy ? health.model_version : 'API offline'}
              </span>
              <RefreshCw
                className={`h-3.5 w-3.5 text-zinc-400 ${checkingHealth ? 'animate-spin' : ''}`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        {activeTab === 'single' ? <SinglePredictor /> : <BatchDashboard />}
      </main>
    </div>
  )
}

export default App
