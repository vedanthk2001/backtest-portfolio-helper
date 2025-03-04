
import { useState } from "react";
import { TickerInput } from "@/components/TickerInput";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PerformanceStatsCard } from "@/components/PerformanceStats";
import { PortfolioAsset, calculatePortfolioPerformance, PortfolioPerformance } from "@/utils/portfolioCalculations";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    if (assets.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one asset to your portfolio",
        variant: "destructive",
      });
      return;
    }

    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast({
        title: "Error",
        description: "Portfolio weights must sum to 100%",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculatePortfolioPerformance(assets);
      
      if (!result) {
        toast({
          title: "Error",
          description: "Failed to calculate portfolio performance",
          variant: "destructive",
        });
        return;
      }
      
      setPerformance(result);
      toast({
        title: "Success",
        description: "Portfolio performance calculated successfully",
      });
    } catch (error) {
      console.error("Error calculating portfolio performance:", error);
      toast({
        title: "Error",
        description: "Failed to calculate portfolio performance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container py-8 px-4 mx-auto">
        <header className="text-center mb-12 animate-slide-down">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Portfolio Backtesting</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Evaluate historical performance of your investment portfolio. Enter stock tickers, 
            allocate weights, and visualize returns over different time periods.
          </p>
        </header>

        <div className="space-y-8 max-w-5xl mx-auto">
          <TickerInput 
            assets={assets} 
            setAssets={setAssets} 
            onCalculate={handleCalculate}
            isLoading={isLoading}
          />
          
          {(performance || isLoading) && (
            <div className="space-y-8">
              <PortfolioChart performance={performance} isLoading={isLoading} />
              <PerformanceStatsCard stats={performance?.stats || null} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
