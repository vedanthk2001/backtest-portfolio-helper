
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

interface PerformanceStatsCardProps {
  stats: PerformanceStats[] | null;
  isLoading: boolean;
}

export function PerformanceStatsCard({ stats, isLoading }: PerformanceStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse stats-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Performance Statistics</CardTitle>
        </CardHeader>
        <CardContent className="h-44 bg-muted/50 rounded-md"></CardContent>
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
    return value >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500';
  };
  
  return (
    <Card className="stats-card animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Total Return</TableHead>
                <TableHead>CAGR</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead>Sharpe Ratio</TableHead>
                <TableHead>Max Drawdown</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.period} className="smooth-transition">
                  <TableCell className="font-medium">{stat.period}</TableCell>
                  <TableCell className={getValueColorClass(stat.totalReturn)}>
                    {stat.totalReturn >= 0 ? '+' : ''}{formatNumber(stat.totalReturn)}%
                  </TableCell>
                  <TableCell className={getValueColorClass(stat.cagr)}>
                    {stat.cagr >= 0 ? '+' : ''}{formatNumber(stat.cagr)}%
                  </TableCell>
                  <TableCell>{formatNumber(stat.volatility)}%</TableCell>
                  <TableCell className={getValueColorClass(stat.sharpeRatio)}>
                    {formatNumber(stat.sharpeRatio)}
                  </TableCell>
                  <TableCell className="text-rose-600 dark:text-rose-500">
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
