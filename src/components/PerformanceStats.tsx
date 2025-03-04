
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PerformanceStats } from '@/utils/portfolioCalculations';
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";

interface PerformanceStatsCardProps {
  stats: PerformanceStats[] | null;
  isLoading: boolean;
}

export function PerformanceStatsCard({ stats, isLoading }: PerformanceStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse stats-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="h-44 bg-muted/20 rounded-md"></CardContent>
      </Card>
    );
  }
  
  if (!stats || stats.length === 0) {
    return null;
  }
  
  // Format numbers for display
  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };
  
  // Style for positive/negative values
  const getValueColorClass = (value: number) => {
    return value >= 0 ? 'text-emerald-400' : 'text-rose-400';
  };
  
  return (
    <Card className="stats-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-medium tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <span>Performance Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10">
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">Period</TableHead>
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">Total Return</TableHead>
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">CAGR</TableHead>
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">Volatility</TableHead>
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">Sharpe Ratio</TableHead>
                <TableHead className="text-blue-300 font-medium tracking-wide text-sm">Max Drawdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat, index) => (
                <TableRow 
                  key={stat.period} 
                  className="smooth-transition hover:bg-white/5 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TableCell className="font-medium tracking-wide">{stat.period}</TableCell>
                  <TableCell className={`${getValueColorClass(stat.totalReturn)} flex items-center gap-1 font-light`}>
                    {stat.totalReturn >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.totalReturn >= 0 ? '+' : ''}{formatNumber(stat.totalReturn)}%
                  </TableCell>
                  <TableCell className={`${getValueColorClass(stat.cagr)} font-light`}>
                    {stat.cagr >= 0 ? '+' : ''}{formatNumber(stat.cagr)}%
                  </TableCell>
                  <TableCell className="text-gray-300 font-light">{formatNumber(stat.volatility)}%</TableCell>
                  <TableCell className={`${getValueColorClass(stat.sharpeRatio)} font-light`}>
                    {formatNumber(stat.sharpeRatio)}
                  </TableCell>
                  <TableCell className="text-rose-400 font-light">
                    {formatNumber(stat.maxDrawdown)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
