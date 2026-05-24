# Architecture — NSE Portfolio Backtester

## What We Have (Current State)

```
Browser (React SPA)
  ├── TickerInput — manual ticker entry, no search
  ├── PortfolioChart — single portfolio line, no benchmark
  └── PerformanceStats — table of stats, no benchmark comparison
        │  POST http://localhost:5000/api/portfolio/calculate (hardcoded)
        ▼
Express Server
  └── portfolioCalculations.js — fetches data, computes stats
        │
        ▼
Yahoo Finance API (.NS suffix for NSE)
```

**Problems with current state:**
- API URL hardcoded to `http://localhost:5000` — breaks in any non-local env
- `src/utils/yahooFinance.ts` is dead code — browser CORS blocks direct Yahoo Finance calls
- `src/utils/portfolioCalculations.ts` has a duplicate frontend calculation path — also dead code
- No stock search — user must know exact tickers
- No benchmark comparison
- No listing date guardrails
- UI is over-decorated (floats, glows, glassmorphism, grid bg)

---

## What We're Building (Target State)

```
Browser (React SPA)
  ├── StockSearch — fuzzy search, client-side, instant, backed by stocks.json
  ├── PortfolioBuilder — weights, validation, benchmark picker, period guardrail
  └── Results
        ├── MetricsCards — CAGR / Volatility / Sharpe / Drawdown (portfolio vs benchmark)
        └── PortfolioChart — portfolio + benchmark lines, period toggle
              │  POST /api/portfolio/calculate  (relative URL via Vite proxy)
              ▼
Express Server
  ├── GET  /api/stocks             → serve stocks.json
  └── POST /api/portfolio/calculate → fetch portfolio + benchmark, compute stats
        │
        ▼
Yahoo Finance API (portfolio tickers + benchmark ticker)
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Stock search is client-side | stocks.json is 249 entries — no API needed, instant results |
| All Yahoo Finance calls go through backend | Avoids CORS, keeps browser clean |
| API URL is relative (`/api`) via Vite proxy | Works locally and in production with a reverse proxy |
| Backend returns portfolio + benchmark in one call | Single round trip, easier to align dates |
| Types live in `src/types/portfolio.ts` | Single source of truth shared across components |
| Period guardrail is frontend-only | Backend returns max data; frontend disables tabs based on listing dates |

---

## File Structure (Target)

```
src/
  types/
    portfolio.ts         ← all shared types + constants (BENCHMARKS, PERIODS)
  data/
    stocks.json          ← 249 NSE stocks (already built)
  hooks/
    useStockSearch.ts    ← fuzzy search against stocks.json
  utils/
    api.ts               ← single fetch wrapper (relative URL)
  components/
    StockSearch.tsx      ← typeahead dropdown (keyboard nav, click-outside)
    PortfolioBuilder.tsx ← main builder card
    MetricsCards.tsx     ← 4 metric cards with portfolio vs benchmark
    PortfolioChart.tsx   ← recharts line chart (portfolio + benchmark)
    ui/                  ← shadcn (untouched)
  pages/
    Index.tsx            ← page layout, state orchestration
    NotFound.tsx         ← unchanged
  lib/
    utils.ts             ← unchanged

server/
  index.js               ← Express app (updated)
  yahooFinance.js        ← Yahoo Finance wrapper (unchanged)
  portfolioCalculations.js ← updated: accepts benchmark, returns benchmarkValues + benchmarkStats
  data/ (optional)       ← server can read stocks.json from src/data if needed

DELETE:
  src/utils/yahooFinance.ts        ← dead code
  src/utils/portfolioCalculations.ts ← dead code (types moved to src/types/portfolio.ts)
  src/components/TickerInput.tsx   ← replaced by PortfolioBuilder
  src/components/PerformanceStats.tsx ← replaced by MetricsCards
```

---

## Data Flow

1. User types "zomato" → `useStockSearch` scores stocks.json → shows Eternal Limited
2. User selects stocks, assigns weights
3. Frontend computes `latestListingDate` from selected stocks' listing dates
4. Period tabs (1Y/3Y/5Y/10Y/Max) are enabled/disabled against listing date
5. User selects benchmark, clicks "Run Backtest"
6. `POST /api/portfolio/calculate` with `{ assets, benchmark }`
7. Backend fetches all tickers + benchmark from Yahoo Finance in parallel
8. Backend aligns dates (intersection of dates where all stocks have data)
9. Backend normalizes portfolio and benchmark to 1.0 at start
10. Backend returns: `{ dates, portfolioValues, benchmarkValues, stats, benchmarkStats }`
11. Frontend renders MetricsCards + PortfolioChart

---

## API Contract

**Request:**
```json
POST /api/portfolio/calculate
{ "assets": [{ "ticker": "RELIANCE.NS", "weight": 60 }, ...], "benchmark": "^NSEI" }
```

**Response:**
```json
{
  "dates": ["2015-01-05", "2015-01-06", ...],
  "portfolioValues": [1.0, 1.003, ...],
  "benchmarkValues": [1.0, 0.998, ...],
  "stats": [{ "period": "1Y", "totalReturn": 18.4, "cagr": 18.4, "volatility": 14.2, "sharpeRatio": 1.3, "maxDrawdown": 12.1 }, ...],
  "benchmarkStats": [{ "period": "1Y", ... }]
}
```
