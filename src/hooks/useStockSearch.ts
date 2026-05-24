import { useMemo } from 'react'
import stocksData from '@/data/stocks.json'
import type { Stock } from '@/types/portfolio'

const stocks = stocksData as Stock[]

function score(stock: Stock, query: string): number {
  const q = query.toLowerCase().trim()
  const ticker = stock.ticker.toLowerCase().replace('.ns', '')
  const name = stock.officialName.toLowerCase()

  if (ticker === q) return 100
  if (ticker.startsWith(q)) return 90
  if (name === q) return 85
  if (name.startsWith(q)) return 80

  for (const alias of stock.commonNames) {
    const a = alias.toLowerCase()
    if (a === q) return 85
    if (a.startsWith(q)) return 75
  }

  if (name.includes(q)) return 60
  for (const alias of stock.commonNames) {
    if (alias.toLowerCase().includes(q)) return 55
  }

  return 0
}

export function useStockSearch(query: string, limit = 8): Stock[] {
  return useMemo(() => {
    const q = query.trim()
    if (q.length < 1) return []

    return stocks
      .map(s => ({ s, score: score(s, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ s }) => s)
  }, [query, limit])
}
