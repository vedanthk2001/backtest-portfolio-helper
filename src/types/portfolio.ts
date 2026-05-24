export interface Stock {
  ticker: string
  officialName: string
  commonNames: string[]
  sector: string
  listingDate: string
}

export interface PortfolioEntry {
  ticker: string
  officialName: string
  weight: number
  listingDate: string
}

export interface PeriodStats {
  period: string
  totalReturn: number
  cagr: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
}

export interface BacktestResult {
  dates: string[]
  portfolioValues: number[]
  benchmarkValues: number[]
  stats: PeriodStats[]
  benchmarkStats: PeriodStats[]
}

export const BENCHMARKS = [
  { label: 'Nifty 50', ticker: '^NSEI' },
  { label: 'Sensex', ticker: '^BSESN' },
  { label: 'Nifty Next 50', ticker: '^NSMIDCP' },
] as const

export const PERIODS = [
  { label: '1Y', years: 1 },
  { label: '3Y', years: 3 },
  { label: '5Y', years: 5 },
  { label: '10Y', years: 10 },
  { label: 'Max', years: Infinity },
] as const
