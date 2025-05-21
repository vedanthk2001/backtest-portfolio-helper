
import { PortfolioAsset, PortfolioPerformance } from './portfolioCalculations';

const API_URL = 'http://localhost:5000/api';

// Function to calculate portfolio performance using the backend API
export async function calculatePortfolioPerformanceAPI(
  assets: PortfolioAsset[]
): Promise<PortfolioPerformance | null> {
  try {
    const response = await fetch(`${API_URL}/portfolio/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assets }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to calculate portfolio performance');
    }

    const data = await response.json();
    return data.performance;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
