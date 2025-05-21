
const express = require('express');
const cors = require('cors');
const yahooFinance = require('./yahooFinance');
const portfolioCalculations = require('./portfolioCalculations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to fetch stock data
app.post('/api/portfolio/calculate', async (req, res) => {
  try {
    const { assets } = req.body;
    
    if (!assets || assets.length === 0) {
      return res.status(400).json({ error: 'Please add at least one asset to your portfolio' });
    }
    
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ error: 'Portfolio weights must sum to 100%' });
    }
    
    const performance = await portfolioCalculations.calculatePortfolioPerformance(assets);
    
    if (!performance) {
      return res.status(500).json({ error: 'Failed to calculate portfolio performance' });
    }
    
    return res.json({ performance });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
