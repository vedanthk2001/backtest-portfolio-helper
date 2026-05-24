import type { BacktestResult } from '@/types/portfolio'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function runBacktest(
  assets: { ticker: string; weight: number }[],
  benchmark: string
): Promise<BacktestResult> {
  const res = await fetch(`${API_BASE}/api/portfolio/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assets, benchmark }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Request failed: ${res.status}`)
  }

  return res.json()
}
