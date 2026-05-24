import type { PeriodStats } from '@/types/portfolio'
import { cn } from '@/lib/utils'

interface MetricsCardsProps {
  portfolioStats: PeriodStats | null
  benchmarkStats: PeriodStats | null
  benchmarkLabel: string
}

interface CardProps {
  label: string
  portfolioValue: number
  benchmarkValue: number
  unit?: string
  higherIsBetter?: boolean
}

function MetricCard({ label, portfolioValue, benchmarkValue, unit = '%', higherIsBetter = true }: CardProps) {
  const beatsMarket = higherIsBetter ? portfolioValue > benchmarkValue : portfolioValue < benchmarkValue
  const isNegative = portfolioValue < 0

  const fmt = (v: number) => `${v >= 0 && unit === '%' && label !== 'Max Drawdown' ? '+' : ''}${v.toFixed(2)}${unit}`

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className={cn(
        'text-2xl font-mono font-semibold tabular-nums',
        label === 'Max Drawdown' ? 'text-red-400' : isNegative ? 'text-red-400' : 'text-green-400'
      )}>
        {label === 'Max Drawdown' ? `-${portfolioValue.toFixed(2)}%` : fmt(portfolioValue)}
      </p>
      <p className={cn(
        'text-xs font-mono tabular-nums mt-1.5',
        beatsMarket ? 'text-green-500/70' : 'text-muted-foreground'
      )}>
        vs {label === 'Max Drawdown' ? `-${benchmarkValue.toFixed(2)}%` : fmt(benchmarkValue)}
        {beatsMarket && <span className="ml-1 text-green-500">↑</span>}
      </p>
    </div>
  )
}

export function MetricsCards({ portfolioStats, benchmarkStats, benchmarkLabel }: MetricsCardsProps) {
  if (!portfolioStats || !benchmarkStats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        label="CAGR"
        portfolioValue={portfolioStats.cagr}
        benchmarkValue={benchmarkStats.cagr}
        higherIsBetter={true}
      />
      <MetricCard
        label="Volatility"
        portfolioValue={portfolioStats.volatility}
        benchmarkValue={benchmarkStats.volatility}
        higherIsBetter={false}
      />
      <MetricCard
        label="Sharpe Ratio"
        portfolioValue={portfolioStats.sharpeRatio}
        benchmarkValue={benchmarkStats.sharpeRatio}
        unit=""
        higherIsBetter={true}
      />
      <MetricCard
        label="Max Drawdown"
        portfolioValue={portfolioStats.maxDrawdown}
        benchmarkValue={benchmarkStats.maxDrawdown}
        higherIsBetter={false}
      />
    </div>
  )
}
