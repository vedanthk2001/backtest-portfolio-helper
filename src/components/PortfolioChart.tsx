import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { PERIODS } from '@/types/portfolio'
import type { BacktestResult } from '@/types/portfolio'
import { cn } from '@/lib/utils'

interface PortfolioChartProps {
  result: BacktestResult
  period: string
  onPeriodChange: (period: string) => void
  disabledPeriods: Set<string>
  benchmarkLabel: string
}

export function PortfolioChart({
  result, period, onPeriodChange, disabledPeriods, benchmarkLabel,
}: PortfolioChartProps) {
  const chartData = useMemo(() => {
    const { dates, portfolioValues, benchmarkValues } = result

    let startIndex = 0
    if (period !== 'Max') {
      const years = parseInt(period)
      const cutoff = new Date()
      cutoff.setFullYear(cutoff.getFullYear() - years)
      for (let i = 0; i < dates.length; i++) {
        if (new Date(dates[i]) >= cutoff) { startIndex = i; break }
      }
    }

    const pStart = portfolioValues[startIndex]
    const bStart = benchmarkValues[startIndex]

    return dates.slice(startIndex).map((date, i) => ({
      date,
      Portfolio: +((portfolioValues[startIndex + i] / pStart) * 100).toFixed(2),
      [benchmarkLabel]: +((benchmarkValues[startIndex + i] / bStart) * 100).toFixed(2),
    }))
  }, [result, period, benchmarkLabel])

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.toLocaleString('default', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="p-2.5 rounded-md border border-border bg-card shadow-lg text-xs">
        <p className="text-muted-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}</span>
            <span className="font-mono tabular-nums">{p.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Performance (indexed to 100)</p>
        <div className="flex gap-1">
          {PERIODS.map(({ label, years }) => {
            const disabled = disabledPeriods.has(label)
            return (
              <button
                key={label}
                onClick={() => !disabled && onPeriodChange(label)}
                disabled={disabled}
                className={cn(
                  'px-2.5 py-1 text-xs rounded transition-colors',
                  period === label
                    ? 'bg-primary text-primary-foreground'
                    : disabled
                    ? 'text-muted-foreground/30 cursor-not-allowed line-through'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `${v}`}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            width={42}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="Portfolio"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey={benchmarkLabel}
            stroke="#64748b"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 3"
            activeDot={{ r: 3, fill: '#64748b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
