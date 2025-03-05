
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioPerformance } from '@/utils/portfolioCalculations';

interface ChartData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  performance: PortfolioPerformance | null;
  isLoading: boolean;
}

export function PortfolioChart({ performance, isLoading }: PortfolioChartProps) {
  const [timePeriod, setTimePeriod] = useState('max');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  
  // Prepare chart data when performance data changes or time period changes
  useEffect(() => {
    if (!performance) {
      setChartData([]);
      return;
    }
    
    const { dates, normalizedValues } = performance;
    
    // Apply time filter
    let startIndex = 0;
    const now = new Date();
    
    if (timePeriod !== 'max') {
      const yearsBack = parseInt(timePeriod);
      const cutoffDate = new Date();
      cutoffDate.setFullYear(now.getFullYear() - yearsBack);
      
      for (let i = 0; i < dates.length; i++) {
        if (dates[i] >= cutoffDate) {
          startIndex = Math.max(0, i);
          break;
        }
      }
    }
    
    // Create data for chart
    const filteredData: ChartData[] = [];
    for (let i = startIndex; i < dates.length; i++) {
      filteredData.push({
        date: dates[i].toISOString().split('T')[0],
        value: normalizedValues[i]
      });
    }
    
    setChartData(filteredData);
  }, [performance, timePeriod]);
  
  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip p-2 bg-background/95 border border-border rounded shadow-lg">
          <p className="label text-xs sm:text-sm font-medium">{`Date: ${label}`}</p>
          <p className="value text-xs sm:text-sm">
            Value: <span className="font-medium text-primary">{(payload[0].value * 100).toFixed(2)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse chart-container">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-lg md:text-xl font-medium">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-60 sm:h-80 bg-muted/50 rounded-md p-0"></CardContent>
      </Card>
    );
  }
  
  if (!performance) {
    return null;
  }
  
  const startValue = chartData.length > 0 ? chartData[0].value : 1;
  const endValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 1;
  const percentChange = ((endValue / startValue - 1) * 100).toFixed(2);
  const isPositive = Number(percentChange) >= 0;
  
  return (
    <Card className="chart-container animate-fade-in">
      <CardHeader className="pb-2 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <CardTitle className="text-lg md:text-xl font-medium">Portfolio Performance</CardTitle>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Return</p>
            <p className={`text-base md:text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? '+' : ''}{percentChange}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-2">
        <div className="space-y-3 md:space-y-4">
          <div className="flex justify-center overflow-x-auto py-2">
            <TabsList className="h-8">
              <TabsTrigger 
                value="1" 
                onClick={() => setTimePeriod('1')}
                className={`text-xs px-2 ${timePeriod === '1' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                1Y
              </TabsTrigger>
              <TabsTrigger 
                value="3" 
                onClick={() => setTimePeriod('3')}
                className={`text-xs px-2 ${timePeriod === '3' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                3Y
              </TabsTrigger>
              <TabsTrigger 
                value="5" 
                onClick={() => setTimePeriod('5')}
                className={`text-xs px-2 ${timePeriod === '5' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                5Y
              </TabsTrigger>
              <TabsTrigger 
                value="10" 
                onClick={() => setTimePeriod('10')}
                className={`text-xs px-2 ${timePeriod === '10' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                10Y
              </TabsTrigger>
              <TabsTrigger 
                value="max" 
                onClick={() => setTimePeriod('max')}
                className={`text-xs px-2 ${timePeriod === 'max' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                Max
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="h-60 sm:h-80 px-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const dateObj = new Date(date);
                    return `${dateObj.getMonth() + 1}/${dateObj.getFullYear().toString().substr(-2)}`;
                  }} 
                  tick={{ fontSize: 10 }}
                  tickMargin={8}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                  tick={{ fontSize: 10 }}
                  domain={['dataMin', 'dataMax']}
                  tickMargin={5}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Portfolio"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
