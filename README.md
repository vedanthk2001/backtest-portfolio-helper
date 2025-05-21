
# Portfolio Backtesting Application

This is a portfolio backtesting application that allows users to evaluate the historical performance of investment portfolios.

## Project Structure

The project is divided into two main parts:

1. **Frontend**: A React application built with TypeScript, Vite, and Tailwind CSS
2. **Backend**: A Node.js server using Express to handle API requests and calculations

## Getting Started

### Backend Setup

1. Navigate to the server directory:
```
cd server
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm run dev
```

The server will be running on http://localhost:5000

### Frontend Setup

1. Navigate to the root directory and install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

The frontend application will be running on http://localhost:3000

## Features

- Add multiple stocks to a portfolio with customizable weights
- Calculate historical performance using data from Yahoo Finance
- View portfolio performance charts over different time periods
- Analyze key performance statistics (CAGR, Volatility, Sharpe Ratio, etc.)

## Technologies Used

### Frontend
- React
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Shadcn/UI components

### Backend
- Node.js
- Express
- Yahoo Finance API integration

## API Endpoints

- `POST /api/portfolio/calculate`: Calculate portfolio performance based on provided assets
