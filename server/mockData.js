// Deterministic mock data generator using seeded geometric Brownian motion.
// Used when Yahoo Finance is unreachable (e.g. cloud dev environments).

function seededRandom(seed) {
  let s = seed >>> 0
  return function () {
    s = Math.imul(1664525, s) + 1013904223 >>> 0
    return s / 4294967296
  }
}

function tickerSeed(ticker) {
  let h = 0
  for (let i = 0; i < ticker.length; i++) {
    h = Math.imul(31, h) + ticker.charCodeAt(i) >>> 0
  }
  return h || 1
}

function tradingDays(startYear = 2012) {
  const days = []
  const d = new Date(startYear, 0, 2)
  const end = new Date()
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      days.push(d.toISOString().split('T')[0])
    }
    d.setDate(d.getDate() + 1)
  }
  return days
}

function generatePrices(ticker, days) {
  const rand = seededRandom(tickerSeed(ticker))
  // Box-Muller for normal distribution
  function randn() {
    let u, v
    do { u = rand(); v = rand() } while (u === 0)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  // Calibrated to look like Indian large-cap stocks
  const annualDrift = 0.10 + rand() * 0.08   // 10–18% annual
  const annualVol   = 0.18 + rand() * 0.12   // 18–30% annual vol
  const dailyDrift  = annualDrift / 252
  const dailyVol    = annualVol / Math.sqrt(252)

  const prices = [100]
  for (let i = 1; i < days.length; i++) {
    const r = dailyDrift + dailyVol * randn()
    prices.push(+(prices[i - 1] * Math.exp(r)).toFixed(4))
  }
  return prices
}

function mockStockData(ticker) {
  const days = tradingDays()
  const prices = generatePrices(ticker, days)
  return {
    symbol: ticker,
    name: ticker,
    data: days.map((d, i) => ({
      date: new Date(d),
      close: prices[i],
      adjClose: prices[i],
      volume: 1000000,
    })),
  }
}

module.exports = { mockStockData }
