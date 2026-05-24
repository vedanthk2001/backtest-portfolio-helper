# Brainstorming — Backtest Portfolio Helper

## What We're Building

A web app where anyone can pick Indian stocks, assign weights, and see how that portfolio would have performed historically. No accounts, no complexity — just stocks, weights, and results.

---

## Core User Flow

1. User searches for stocks by common name (e.g. "Zomato", "Reliance")
2. Selects stocks and assigns weights (must sum to 100%)
3. Selects a lookback period — **blocked behind the earliest IPO date** among selected stocks
4. App runs a historical backtest and shows results + charts

---

## What's In Scope

- Historical backtest (real past prices, not simulation/Monte Carlo)
- Portfolio performance metrics: CAGR, volatility, Sharpe ratio, max drawdown
- Benchmark comparison: Nifty 50 (default) + Sensex, Nifty Next 50 as options
- Smart stock search: common name → ticker mapping (top 250 NSE stocks)
- Lookback period guardrail: block periods before a stock's IPO date
- No rebalancing — pure buy-and-hold
- No user accounts — stateless, one-shot

## What's Out of Scope (for now)

- Monte Carlo / forward simulation
- Rebalancing options
- User login / saved portfolios
- Paid data sources
- Stocks outside top 250 NSE

---

## Data Strategy

**Source:** Yahoo Finance public API (free, no auth needed)
- NSE stocks available with `.NS` suffix (e.g. `RELIANCE.NS`, `ETERNAL.NS`)
- Already integrated in the backend
- Limitation: occasionally unreliable, no SLA — acceptable for now

**Stock Name Mapping (top 250 NSE stocks):**
- Maintain a local JSON file: ticker → { officialName, commonNames[], sector }
- Example: `ETERNAL.NS` → { "Eternal Limited", ["Zomato", "Zomato Ltd"], "Consumer" }
- Built manually in batches — covers the major problem
- This file is the source of truth for search

**IPO / listing date:**
- Store listing date per stock in the same mapping file
- Used to enforce lookback period guardrails

---

## Benchmarks

| Benchmark | Ticker |
|---|---|
| Nifty 50 (default) | `^NSEI` |
| Sensex | `^BSESN` |
| Nifty Next 50 | `^NSMIDCP` |

---

## Stock Search

- Fuzzy search on common names + official names
- Example: typing "zomato" matches `ETERNAL.NS`
- Example: typing "hdfc bank" matches `HDFCBANK.NS`
- Backed by the local mapping JSON — no external search API needed

---

## Lookback Period Guardrail

- Once stocks are selected, compute the **latest listing date** among them
- Block any lookback period that goes before that date
- Show a message: "Earliest available data for this portfolio: Jul 2021 (Zomato listing)"

---

## Plotting

- Portfolio value over time (indexed to 100 at start)
- Benchmark overlaid on the same chart
- Drawdown chart
- Metrics card: CAGR, volatility, Sharpe, max drawdown — portfolio vs benchmark

---

## UI Direction

**Inspiration:**
- **Screener.in** — data-dense but clean, strong typography, good stock page layout
- **Tickertape.in** — modern feel, excellent stock search UX, smooth filters
- **Portfolio Visualizer** — gold standard for backtest results layout (charts + metrics side by side)
- **Curvo.eu** — beautifully minimal results page, clean and uncluttered
- **Composer.trade** — best-in-class asset search and portfolio builder flow

**Target aesthetic:** Tickertape's search + Curvo's results page + Screener's data density

**Key UI moments to nail:**
- Stock search with typeahead (common name → ticker, e.g. "Zomato" resolves to Eternal)
- Weight inputs that enforce 100% total (auto-balance or show live remainder)
- Chart with benchmark overlay clearly visible and labeled
- Metrics cards (CAGR, Sharpe, drawdown) above the fold — portfolio vs benchmark side by side

---

## Open Questions

- Which charting library? (Recharts already in use — probably fine)
- Do we show individual stock contribution breakdown?
- What if Yahoo Finance has missing/bad data for a stock on certain dates?

---

## Build Order (rough)

1. Build the top 250 stock name mapping JSON
2. Wire up fuzzy search on frontend
3. Add listing date guardrail to lookback period selector
4. Add benchmark fetching + overlay to charts
5. Polish metrics display
6. Test with real portfolios end to end
