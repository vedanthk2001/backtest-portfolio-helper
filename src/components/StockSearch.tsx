import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useStockSearch } from '@/hooks/useStockSearch'
import type { Stock } from '@/types/portfolio'
import { cn } from '@/lib/utils'

interface StockSearchProps {
  onSelect: (stock: Stock) => void
  excluded: string[]
}

export function StockSearch({ onSelect, excluded }: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const results = useStockSearch(query)
  const filtered = results.filter(s => !excluded.includes(s.ticker))

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(stock: Stock) {
    onSelect(stock)
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          className="w-full h-10 pl-9 pr-4 rounded-md bg-input border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          placeholder="Search — try 'Zomato', 'Reliance', 'HDFC Bank'..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-lg overflow-hidden">
          {filtered.map((stock, i) => (
            <button
              key={stock.ticker}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                i === activeIndex ? 'bg-accent' : 'hover:bg-accent'
              )}
              onMouseDown={e => { e.preventDefault(); handleSelect(stock) }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {stock.ticker.replace('.NS', '')}
              </span>
              <span className="truncate">{stock.officialName}</span>
              <span className="ml-auto text-xs text-muted-foreground shrink-0 hidden sm:block">
                {stock.sector.split(' /')[0]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
