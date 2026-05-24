const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const portfolioCalculations = require('./portfolioCalculations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://genuine-choux-70552d.netlify.app',
    /\.netlify\.app$/,
    /localhost/,
  ]
}));
app.use(express.json());

app.get('/api/stocks', (req, res) => {
  try {
    const stocksPath = path.join(__dirname, '..', 'src', 'data', 'stocks.json');
    const stocks = JSON.parse(fs.readFileSync(stocksPath, 'utf-8'));
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stocks data' });
  }
});

app.post('/api/portfolio/calculate', async (req, res) => {
  try {
    const { assets, benchmark = '^NSEI' } = req.body;

    if (!assets || assets.length === 0) {
      return res.status(400).json({ error: 'Add at least one stock to your portfolio' });
    }

    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ error: 'Portfolio weights must sum to 100%' });
    }

    const result = await portfolioCalculations.calculatePortfolioPerformance(assets, benchmark);
    res.json(result);
  } catch (err) {
    console.error('Backtest error:', err.message);
    res.status(500).json({ error: err.message || 'Backtest failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
