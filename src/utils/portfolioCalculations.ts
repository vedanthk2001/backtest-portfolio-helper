
import { fetchMultipleStocks } from './yahooFinance';

export interface PortfolioAsset {
  ticker: string;
  weight: number;
}

export interface PerformanceStats {
  period: string;
  cagr: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
}

export interface PortfolioPerformance {
  dates: Date[];
  portfolioValues: number[];
  normalizedValues: number[];
  stats: PerformanceStats[];
}

// Calculate portfolio performance
export async function calculatePortfolioPerformance(
  assets: PortfolioAsset[]
): Promise<PortfolioPerformance | null> {
  try {
    // Validate weights sum to 100%
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      throw new Error('Portfolio weights must sum to 100%');
    }

    // Fetch data for all tickers (using max period)
    const symbols = assets.map(asset => asset.ticker);
    const stockDataMap = await fetchMultipleStocks(symbols, 'max');
    
    // Check if all data was fetched successfully
    for (const symbol of symbols) {
      if (!stockDataMap.get(symbol)) {
        throw new Error(`Failed to fetch data for ${symbol}`);
      }
    }

    // Normalize weights (divide by 100 to get decimal weights)
    const normalizedAssets = assets.map(asset => ({
      ...asset,
      weight: asset.weight / 100
    }));

    // Find the earliest common date among all stocks
    let allDates = new Set<string>();
    const dateToDataMap = new Map<string, Map<string, number>>();
    
    // First, collect all available dates and prices
    for (const symbol of symbols) {
      const stockInfo = stockDataMap.get(symbol)!;
      for (const dataPoint of stockInfo.data) {
        const dateStr = dataPoint.date.toISOString().split('T')[0];
        
        if (!dateToDataMap.has(dateStr)) {
          dateToDataMap.set(dateStr, new Map<string, number>());
        }
        
        dateToDataMap.get(dateStr)!.set(symbol, dataPoint.adjClose);
        allDates.add(dateStr);
      }
    }
    
    // Convert dates set to array and sort
    const sortedDates = Array.from(allDates).sort();
    
    // Filter out dates where we don't have data for all symbols
    const validDates = sortedDates.filter(dateStr => {
      const pricesForDate = dateToDataMap.get(dateStr)!;
      return symbols.every(symbol => pricesForDate.has(symbol));
    });
    
    // Create date objects from valid date strings
    const dates = validDates.map(dateStr => new Date(dateStr));
    
    // Calculate portfolio values for each date
    const portfolioValues: number[] = [];
    const initialPrices = new Map<string, number>();
    
    // Store initial prices (first valid date)
    if (validDates.length > 0) {
      const firstDateStr = validDates[0];
      const firstDatePrices = dateToDataMap.get(firstDateStr)!;
      
      for (const symbol of symbols) {
        initialPrices.set(symbol, firstDatePrices.get(symbol)!);
      }
    }
    
    // Calculate portfolio value for each date
    for (const dateStr of validDates) {
      const pricesForDate = dateToDataMap.get(dateStr)!;
      
      let portfolioValue = 0;
      for (const asset of normalizedAssets) {
        const symbol = asset.ticker;
        const weight = asset.weight;
        const initialPrice = initialPrices.get(symbol)!;
        const currentPrice = pricesForDate.get(symbol)!;
        
        // Calculate the weighted value using price relative to initial price
        portfolioValue += weight * (currentPrice / initialPrice);
      }
      
      portfolioValues.push(portfolioValue);
    }
    
    // Normalize values (starting value = 1)
    const normalizedValues = portfolioValues.map(value => value);

    // Calculate performance statistics for different periods
    const stats: PerformanceStats[] = calculatePerformanceStats(dates, normalizedValues);
    
    return {
      dates,
      portfolioValues,
      normalizedValues,
      stats
    };
    
  } catch (error) {
    console.error('Error calculating portfolio performance:', error);
    return null;
  }
}

// Calculate various performance statistics
function calculatePerformanceStats(dates: Date[], values: number[]): PerformanceStats[] {
  const periods = [
    { name: '1 Year', years: 1 },
    { name: '3 Years', years: 3 },
    { name: '5 Years', years: 5 },
    { name: '10 Years', years: 10 },
    { name: 'Max', years: Infinity }
  ];
  
  const stats: PerformanceStats[] = [];
  const today = new Date();
  
  for (const period of periods) {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(today.getFullYear() - period.years);
    
    // Find index of the closest date to the cutoff
    let startIndex = dates.length - 1;
    if (period.years !== Infinity) {
      for (let i = 0; i < dates.length; i++) {
        if (dates[i] >= cutoffDate) {
          startIndex = Math.max(0, i);
          break;
        }
      }
    } else {
      startIndex = 0; // For Max period, use the full range
    }
    
    // Skip if we don't have enough data for this period
    if (startIndex >= dates.length - 10) { // Need at least 10 data points
      continue;
    }
    
    const periodValues = values.slice(startIndex);
    const periodDates = dates.slice(startIndex);
    
    // Calculate total return
    const startValue = periodValues[0];
    const endValue = periodValues[periodValues.length - 1];
    const totalReturn = ((endValue / startValue) - 1) * 100;
    
    // Calculate CAGR (Compound Annual Growth Rate)
    const yearFraction = (periodDates[periodDates.length - 1].getTime() - periodDates[0].getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const cagr = (Math.pow(endValue / startValue, 1 / yearFraction) - 1) * 100;
    
    // Calculate volatility (annualized standard deviation of daily returns)
    const dailyReturns = [];
    for (let i = 1; i < periodValues.length; i++) {
      dailyReturns.push(periodValues[i] / periodValues[i - 1] - 1);
    }
    
    const meanReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, value) => sum + Math.pow(value - meanReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
    
    // Calculate Sharpe Ratio (assuming risk-free rate of 0% for simplicity)
    const sharpeRatio = cagr / volatility;
    
    // Calculate Maximum Drawdown
    let maxDrawdown = 0;
    let peak = periodValues[0];
    
    for (const value of periodValues) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    stats.push({
      period: period.name,
      cagr,
      volatility,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      totalReturn
    });
  }
  
  return stats;
}
