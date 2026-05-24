# Requirements — NSE Portfolio Backtester

## Product Summary

A stateless web app where any user can build a sample Indian stock portfolio, assign weights, and see how it would have performed historically — compared against a benchmark index.

No login. No accounts. Pick stocks, set weights, see results.

---

## User Flow (end to end)

1. User lands on the app
2. Searches for a stock by common name (e.g. "Zomato", "Reliance", "HDFC")
3. Selects the stock — it gets added to the portfolio builder
4. Assigns a weight (%) to the stock
5. Repeats steps 2–4 until weights sum to 100%
6. Selects a lookback period (1Y / 3Y / 5Y / 10Y / Max)
7. Clicks "Run Backtest"
8. Results page shows portfolio performance vs benchmark

---

## Feature Requirements

### 1. Stock Search

| Requirement | Detail |
|---|---|
| Input type | Text search with typeahead / autocomplete |
| Search source | Local JSON file (`src/data/stocks.json`) — 249 NSE stocks |
| Search behaviour | Fuzzy match on `commonNames` + `officialName` fields |
| Example | Typing "zomato" must return Eternal Limited (ETERNAL.NS) |
| Example | Typing "hdfc" must return HDFC Bank, HDFC Life, HDFC AMC |
| No external API | Search is fully client-side, no network calls |

### 2. Portfolio Builder

| Requirement | Detail |
|---|---|
| Min stocks | 1 |
| Max stocks | No hard limit (practical UI limit ~10) |
| Weight input | Numeric input per stock (%) |
| Validation | Weights must sum to exactly 100% before running backtest |
| Live feedback | Show remaining % as user assigns weights |
| Remove stock | User can remove a stock from the portfolio |

### 3. Lookback Period Guardrail

| Requirement | Detail |
|---|---|
| Periods available | 1Y, 3Y, 5Y, 10Y, Max |
| Guardrail logic | Find the latest `listingDate` among all selected stocks |
| Blocking | Disable any period that starts before that date |
| User message | Show "Earliest available data: [Date] ([Stock Name] listing)" |
| Example | Portfolio with Zomato → 1Y and 3Y available, 5Y/10Y/Max disabled |

### 4. Backtest Engine (Backend)

| Requirement | Detail |
|---|---|
| Data source | Yahoo Finance public API (`.NS` suffix for NSE stocks) |
| Calculation type | Historical buy-and-hold (no rebalancing) |
| Portfolio value | Indexed to 100 at start date, daily granularity |
| Metrics to compute | CAGR, Annualised Volatility, Sharpe Ratio, Max Drawdown |
| Benchmark | Fetched the same way (Nifty 50 = `^NSEI`) |
| Comparison | All metrics shown for portfolio AND benchmark side by side |

### 5. Benchmarks

| Label | Yahoo Finance Ticker |
|---|---|
| Nifty 50 (default) | `^NSEI` |
| Sensex | `^BSESN` |
| Nifty Next 50 | `^NSMIDCP` |

User can switch benchmark from a dropdown. Nifty 50 is pre-selected.

### 6. Results Display

| Element | Detail |
|---|---|
| Performance chart | Line chart — portfolio value vs benchmark, indexed to 100 |
| Drawdown chart | Area chart showing drawdown over time |
| Metrics cards | CAGR, Volatility, Sharpe Ratio, Max Drawdown — portfolio vs benchmark |
| Time period toggle | Switch between periods without re-entering stocks |
| Portfolio summary | List of stocks with weights shown on results page |

### 7. UI Design Direction

- **Search feel:** Tickertape-style typeahead, fast and clean
- **Results feel:** Curvo.eu-style — data front and centre, minimal chrome
- **Data density:** Screener.in-style metrics — numbers are the hero, not decorations
- **Colour:** Dark or neutral background, chart lines in distinct colours
- **Mobile:** Responsive — works on phone browsers

---

## Data File: `src/data/stocks.json`

Already built. Schema per entry:

```json
{
  "ticker": "ETERNAL.NS",
  "officialName": "Eternal Limited",
  "commonNames": ["Zomato", "Eternal", "Zomato Ltd"],
  "sector": "Consumer Internet",
  "listingDate": "2021-07-23"
}
```

249 stocks covering Nifty 50, Next 50, midcaps, new-age tech, banks, pharma, defence, FMCG.

---

## Out of Scope

- User accounts / login / saved portfolios
- Rebalancing
- Monte Carlo / forward simulation
- Stocks outside the 249 in the mapping file
- Paid data APIs
- Transaction cost modelling
- Dividend reinvestment

---

## Tech Stack (existing)

| Layer | Stack |
|---|---|
| Frontend | React 18 + TypeScript, Vite 8, Tailwind CSS, Shadcn/UI |
| Charts | Recharts |
| Backend | Node.js + Express (port 5000) |
| Data | Yahoo Finance public API |

---

## Build Order for Dev

1. **Wire stock search** — fuzzy search on `stocks.json`, typeahead UI
2. **Portfolio builder UI** — add/remove stocks, weight inputs, live sum validation
3. **Lookback period guardrail** — disable periods based on listing dates
4. **Benchmark selector** — dropdown to switch benchmark
5. **Backtest results page** — charts + metrics cards, portfolio vs benchmark
6. **UI polish** — responsive, design direction above
7. **End-to-end testing** — real portfolios, edge cases (single stock, old stock + new stock mix)
