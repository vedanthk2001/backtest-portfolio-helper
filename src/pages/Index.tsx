import { useState, useMemo } from 'react'
import { PortfolioBuilder } from '@/components/PortfolioBuilder'
import { PortfolioChart } from '@/components/PortfolioChart'
import { MetricsCards } from '@/components/MetricsCards'
import { BENCHMARKS, PERIODS } from '@/types/portfolio'
import type { BacktestResult } from '@/types/portfolio'

export default function Index() {
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [period, setPeriod] = useState('Max')
  const [benchmark, setBenchmark] = useState('^NSEI')
  const [latestListingDate, setLatestListingDate] = useState<string | null>(null)

  const benchmarkLabel = BENCHMARKS.find(b => b.ticker === benchmark)?.label ?? 'Benchmark'

  const disabledPeriods = useMemo(() => {
    const disabled = new Set<string>()
    if (!latestListingDate) return disabled
    for (const { label, years } of PERIODS) {
      if (years === Infinity) continue
      const cutoff = new Date()
      cutoff.setFullYear(cutoff.getFullYear() - years)
      if (new Date(latestListingDate) > cutoff) disabled.add(label)
    }
    return disabled
  }, [latestListingDate])

  const selectedStats = useMemo(() => {
    if (!result) return { portfolio: null, benchmark: null }
    const pStat = result.stats.find(s => s.period === period) ?? result.stats[result.stats.length - 1] ?? null
    const bStat = result.benchmarkStats.find(s => s.period === period) ?? result.benchmarkStats[result.benchmarkStats.length - 1] ?? null
    return { portfolio: pStat, benchmark: bStat }
  }, [result, period])

  function handleResult(r: BacktestResult, selectedBenchmark: string, listing: string | null) {
    setResult(r)
    setBenchmark(selectedBenchmark)
    setLatestListingDate(listing)
    setPeriod('Max')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        <header className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">NSE Portfolio Backtester</h1>
          <p className="text-sm text-muted-foreground">
            Pick Indian stocks, set weights, and see how your portfolio would have performed.
          </p>
        </header>

        <div className="rounded-lg border border-border bg-card p-5">
          <PortfolioBuilder onResult={handleResult} />
        </div>

        {result && (
          <div className="space-y-4">
            <MetricsCards
              portfolioStats={selectedStats.portfolio}
              benchmarkStats={selectedStats.benchmark}
              benchmarkLabel={benchmarkLabel}
            />
            <div className="rounded-lg border border-border bg-card p-5">
              <PortfolioChart
                result={result}
                period={period}
                onPeriodChange={setPeriod}
                disabledPeriods={disabledPeriods}
                benchmarkLabel={benchmarkLabel}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
