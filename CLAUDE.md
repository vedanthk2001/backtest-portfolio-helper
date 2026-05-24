# CLAUDE.md — NSE Portfolio Backtester

## What This Is

A web app for backtesting NSE stock portfolios. Users pick stocks by name, assign weights, and see historical performance vs a benchmark index.

## Stack

- **Frontend**: React 18 + TypeScript, Vite 8, Tailwind CSS, Shadcn/UI, Recharts
- **Backend**: Node.js + Express (port 5000)
- **Data**: Yahoo Finance public API (NSE tickers use `.NS` suffix, e.g. `RELIANCE.NS`)
- **Dev**: Vite proxies `/api` → `http://localhost:5000`

## Running Locally

```bash
# Terminal 1 — backend
cd server && node index.js

# Terminal 2 — frontend
npm run dev
```

## Key Files

| File | Purpose |
|---|---|
| `src/types/portfolio.ts` | All shared types + BENCHMARKS + PERIODS constants |
| `src/data/stocks.json` | 249 NSE stocks — ticker, official name, common aliases, sector, listing date |
| `src/hooks/useStockSearch.ts` | Fuzzy search against stocks.json (client-side, instant) |
| `src/utils/api.ts` | Single fetch wrapper for backend API |
| `src/components/StockSearch.tsx` | Typeahead dropdown with keyboard navigation |
| `src/components/PortfolioBuilder.tsx` | Main builder — search, weights, benchmark, guardrail, run |
| `src/components/MetricsCards.tsx` | 4 metric cards (CAGR / Volatility / Sharpe / Drawdown), portfolio vs benchmark |
| `src/components/PortfolioChart.tsx` | Line chart — portfolio (blue) vs benchmark (gray dashed) |
| `server/portfolioCalculations.js` | Core backtest logic — fetches data, aligns dates, computes stats |
| `server/index.js` | Express routes: GET /api/stocks, POST /api/portfolio/calculate |

## API

**POST /api/portfolio/calculate**
```json
// Request
{ "assets": [{ "ticker": "RELIANCE.NS", "weight": 60 }, { "ticker": "HDFCBANK.NS", "weight": 40 }], "benchmark": "^NSEI" }

// Response
{
  "dates": ["2015-01-05", ...],
  "portfolioValues": [1.0, 1.003, ...],
  "benchmarkValues": [1.0, 0.998, ...],
  "stats": [{ "period": "1Y", "totalReturn": 18.4, "cagr": 18.4, "volatility": 14.2, "sharpeRatio": 1.3, "maxDrawdown": 12.1 }],
  "benchmarkStats": [{ "period": "1Y", ... }]
}
```

**GET /api/stocks** — returns stocks.json array

## Stock Search Logic

Fuzzy scoring in `useStockSearch.ts`:
- Exact ticker match → 100
- Ticker starts with query → 90
- Official name / alias starts with query → 75–85
- Name / alias contains query → 55–60

Example: "zomato" → scores `ETERNAL.NS` (Eternal Limited) at 75 via commonNames alias.

## Lookback Period Guardrail

Frontend computes `latestListingDate = max(listingDate for all selected stocks)`.
Period buttons are disabled if `periodStart < latestListingDate`.
Backend always returns max data — the guardrail is purely UI.

## Benchmarks

| Label | Yahoo Finance ticker |
|---|---|
| Nifty 50 | `^NSEI` |
| Sensex | `^BSESN` |
| Nifty Next 50 | `^NSMIDCP` |

## What's Out of Scope (don't add unless discussed)

- User accounts / login
- Rebalancing
- Monte Carlo / forward simulation
- Stocks outside the 249 in stocks.json
- Paid data sources
- Transaction cost modelling
