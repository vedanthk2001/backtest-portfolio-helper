
interface StockData {
  date: Date;
  close: number;
  adjClose: number;
  volume: number;
}

interface StockInfo {
  symbol: string;
  name: string;
  data: StockData[];
}

// Function to fetch data from Yahoo Finance
export async function fetchStockData(
  symbol: string,
  period: '1y' | '3y' | '5y' | '10y' | 'max' = '5y'
): Promise<StockInfo | null> {
  try {
    // Define the interval and time period parameters
    const interval = '1d';
    
    // Calculate the start date based on the period
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;  
      case '5y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case '10y':
        startDate.setFullYear(endDate.getFullYear() - 10);
        break;
      case 'max':
        startDate = new Date(0); // January 1, 1970
        break;
    }
    
    // Convert dates to Unix timestamps (seconds)
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000);
    
    // Construct the URL for Yahoo Finance API
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
    
    // Make the API request
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}, status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if there's valid data in the response
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No data found for ${symbol}`);
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const adjClose = result.indicators.adjclose?.[0]?.adjclose || [];
    
    // Parse the data into our StockData format
    const stockData: StockData[] = timestamps.map((timestamp: number, i: number) => ({
      date: new Date(timestamp * 1000),
      close: quotes.close[i],
      adjClose: adjClose[i] || quotes.close[i], // Use close price if adjClose is not available
      volume: quotes.volume[i]
    })).filter((d: StockData) => d.close != null); // Filter out null/undefined values
    
    return {
      symbol,
      name: result.meta.symbol || symbol, // Use the symbol as name if not available
      data: stockData
    };
    
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

// Function to fetch data for multiple stocks
export async function fetchMultipleStocks(
  symbols: string[],
  period: '1y' | '3y' | '5y' | '10y' | 'max' = '5y'
): Promise<Map<string, StockInfo | null>> {
  const result = new Map<string, StockInfo | null>();
  
  // Use Promise.all to fetch data for all symbols concurrently
  await Promise.all(
    symbols.map(async (symbol) => {
      const data = await fetchStockData(symbol, period);
      result.set(symbol, data);
    })
  );
  
  return result;
}
