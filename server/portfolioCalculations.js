const yahooFinance = require('./yahooFinance');

function computeStats(dates, values) {
  const periods = [
    { name: '1Y', years: 1 },
    { name: '3Y', years: 3 },
    { name: '5Y', years: 5 },
    { name: '10Y', years: 10 },
    { name: 'Max', years: Infinity },
  ];

  const stats = [];

  for (const period of periods) {
    let startIndex = 0;
    if (period.years !== Infinity) {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - period.years);
      startIndex = dates.length;
      for (let i = 0; i < dates.length; i++) {
        if (new Date(dates[i]) >= cutoff) {
          startIndex = i;
          break;
        }
      }
    }

    if (startIndex >= dates.length - 10) continue;

    const periodValues = values.slice(startIndex);
    const periodDates = dates.slice(startIndex);

    const startValue = periodValues[0];
    const endValue = periodValues[periodValues.length - 1];
    const totalReturn = ((endValue / startValue) - 1) * 100;

    const ms = new Date(periodDates[periodDates.length - 1]) - new Date(periodDates[0]);
    const years = ms / (365.25 * 24 * 60 * 60 * 1000);
    const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;

    const dailyReturns = [];
    for (let i = 1; i < periodValues.length; i++) {
      dailyReturns.push(periodValues[i] / periodValues[i - 1] - 1);
    }
    const mean = dailyReturns.reduce((s, v) => s + v, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((s, v) => s + (v - mean) ** 2, 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance * 252) * 100;

    const sharpeRatio = cagr / volatility;

    let maxDrawdown = 0;
    let peak = periodValues[0];
    for (const v of periodValues) {
      if (v > peak) peak = v;
      const dd = (peak - v) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    stats.push({
      period: period.name,
      totalReturn: +totalReturn.toFixed(2),
      cagr: +cagr.toFixed(2),
      volatility: +volatility.toFixed(2),
      sharpeRatio: +sharpeRatio.toFixed(2),
      maxDrawdown: +(maxDrawdown * 100).toFixed(2),
    });
  }

  return stats;
}

async function calculatePortfolioPerformance(assets, benchmark = '^NSEI') {
  const symbols = assets.map(a => a.ticker);
  const weights = assets.map(a => a.weight / 100);

  const [stockDataMap, benchmarkData] = await Promise.all([
    yahooFinance.fetchMultipleStocks(symbols, 'max'),
    yahooFinance.fetchStockData(benchmark, 'max'),
  ]);

  for (const symbol of symbols) {
    if (!stockDataMap.get(symbol)) {
      throw new Error(`Could not fetch data for ${symbol}. Check the ticker symbol.`);
    }
  }
  if (!benchmarkData) {
    throw new Error(`Could not fetch benchmark data for ${benchmark}`);
  }

  // Build date → stock prices map
  const dateToStockPrices = new Map();
  const allDates = new Set();

  for (const symbol of symbols) {
    for (const dp of stockDataMap.get(symbol).data) {
      const d = dp.date.toISOString().split('T')[0];
      if (!dateToStockPrices.has(d)) dateToStockPrices.set(d, new Map());
      dateToStockPrices.get(d).set(symbol, dp.adjClose);
      allDates.add(d);
    }
  }

  // Build benchmark price map
  const benchmarkPriceMap = new Map();
  for (const dp of benchmarkData.data) {
    const d = dp.date.toISOString().split('T')[0];
    benchmarkPriceMap.set(d, dp.adjClose);
  }

  // Valid dates: where ALL portfolio stocks have data
  const validDates = Array.from(allDates)
    .sort()
    .filter(d => symbols.every(s => dateToStockPrices.get(d)?.has(s)));

  if (validDates.length < 20) {
    throw new Error('Insufficient historical data to run backtest');
  }

  // Initial prices at first valid date
  const firstDate = validDates[0];
  const initialPrices = new Map();
  for (const symbol of symbols) {
    initialPrices.set(symbol, dateToStockPrices.get(firstDate).get(symbol));
  }

  // Portfolio values indexed to 1.0
  const portfolioValues = validDates.map(d => {
    let value = 0;
    for (let i = 0; i < symbols.length; i++) {
      value += weights[i] * (dateToStockPrices.get(d).get(symbols[i]) / initialPrices.get(symbols[i]));
    }
    return +value.toFixed(6);
  });

  // Benchmark values: forward-fill for any missing dates, indexed to 1.0 at same start
  let lastBenchmarkPrice = null;
  let benchmarkInitial = null;
  const benchmarkValues = validDates.map(d => {
    if (benchmarkPriceMap.has(d)) lastBenchmarkPrice = benchmarkPriceMap.get(d);
    if (lastBenchmarkPrice === null) return 1.0;
    if (benchmarkInitial === null) benchmarkInitial = lastBenchmarkPrice;
    return +(lastBenchmarkPrice / benchmarkInitial).toFixed(6);
  });

  return {
    dates: validDates,
    portfolioValues,
    benchmarkValues,
    stats: computeStats(validDates, portfolioValues),
    benchmarkStats: computeStats(validDates, benchmarkValues),
  };
}

module.exports = { calculatePortfolioPerformance };
