import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { StockSearch } from './StockSearch'
import { BENCHMARKS, PERIODS } from '@/types/portfolio'
import type { PortfolioEntry, BacktestResult, Stock } from '@/types/portfolio'
import { runBacktest } from '@/utils/api'
import { cn } from '@/lib/utils'

interface PortfolioBuilderProps {
  onResult: (result: BacktestResult, benchmark: string, latestListingDate: string | null) => void
}

export function PortfolioBuilder({ onResult }: PortfolioBuilderProps) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([])
  const [benchmark, setBenchmark] = useState('^NSEI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0)
  const remaining = +(100 - totalWeight).toFixed(1)

  const latestListingDate = entries.length > 0
    ? entries.reduce((latest, e) => e.listingDate > latest ? e.listingDate : latest, entries[0].listingDate)
    : null

  function isPeriodDisabled(years: number) {
    if (!latestListingDate || years === Infinity) return false
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - years)
    return new Date(latestListingDate) > cutoff
  }

  function addStock(stock: Stock) {
    setEntries(prev => [...prev, {
      ticker: stock.ticker,
      officialName: stock.officialName,
      weight: 0,
      listingDate: stock.listingDate,
    }])
  }

  function removeStock(ticker: string) {
    setEntries(prev => prev.filter(e => e.ticker !== ticker))
  }

  function updateWeight(ticker: string, value: string) {
    const weight = parseFloat(value) || 0
    setEntries(prev => prev.map(e => e.ticker === ticker ? { ...e, weight } : e))
  }

  async function handleRun() {
    setError(null)
    setLoading(true)
    try {
      const result = await runBacktest(
        entries.map(e => ({ ticker: e.ticker, weight: e.weight })),
        benchmark
      )
      onResult(result, benchmark, latestListingDate)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const weightOk = Math.abs(totalWeight - 100) < 0.01
  const canRun = entries.length > 0 && weightOk && !loading

  return (
    <div className="space-y-5">
      <StockSearch
        onSelect={addStock}
        excluded={entries.map(e => e.ticker)}
      />

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.ticker} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-background">
              <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {entry.ticker.replace('.NS', '')}
              </span>
              <span className="flex-1 text-sm truncate text-foreground/80">{entry.officialName}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  value={entry.weight || ''}
                  onChange={e => updateWeight(entry.ticker, e.target.value)}
                  className="w-16 h-7 text-center text-sm rounded border border-border bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="0"
                  min={0}
                  max={100}
                  step={1}
                />
                <span className="text-sm text-muted-foreground w-3">%</span>
              </div>
              <button
                onClick={() => removeStock(entry.ticker)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between text-sm px-1 pt-1">
            <span className="text-muted-foreground">Allocated</span>
            <span className={cn(
              'font-mono tabular-nums',
              weightOk ? 'text-green-400' : remaining < 0 ? 'text-red-400' : 'text-foreground'
            )}>
              {totalWeight.toFixed(1)}%
              {!weightOk && (
                <span className="text-muted-foreground font-sans font-normal">
                  {remaining > 0 ? ` · ${remaining}% left` : ` · ${Math.abs(remaining)}% over`}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-4 pt-1 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Benchmark</p>
            <div className="flex flex-wrap gap-2">
              {BENCHMARKS.map(b => (
                <button
                  key={b.ticker}
                  onClick={() => setBenchmark(b.ticker)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded border transition-colors',
                    benchmark === b.ticker
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {latestListingDate && (
            <div className="text-xs text-muted-foreground">
              <span>Available lookback periods — restricted to after </span>
              <span className="text-foreground">
                {new Date(latestListingDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
              <span> (latest IPO in your portfolio):</span>
              <div className="flex gap-2 mt-2">
                {PERIODS.map(({ label, years }) => {
                  const disabled = isPeriodDisabled(years)
                  return (
                    <span
                      key={label}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs border',
                        disabled
                          ? 'border-border text-muted-foreground/40 line-through'
                          : 'border-green-800 text-green-400 bg-green-400/5'
                      )}
                    >
                      {label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={!canRun}
            className={cn(
              'w-full h-10 rounded-md text-sm font-medium transition-colors',
              canRun
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {loading ? 'Running backtest...' : 'Run Backtest →'}
          </button>
        </div>
      )}
    </div>
  )
}
