
import { useState } from "react";
import { TickerInput } from "@/components/TickerInput";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PerformanceStatsCard } from "@/components/PerformanceStats";
import { PortfolioAsset, calculatePortfolioPerformance, PortfolioPerformance } from "@/utils/portfolioCalculations";
import { toast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-background animate-fade-in grid-bg">
      {/* Abstract shapes */}
      <div className="fixed top-20 left-[10%] w-64 h-64 rounded-full bg-blue-500/5 blur-3xl"></div>
      <div className="fixed bottom-20 right-[5%] w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"></div>
      
      <div className="container py-12 px-4 mx-auto relative z-10">
        <header className="text-center mb-16 animate-slide-down">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-blue-400 mr-2 animate-float" />
            <h1 className="text-5xl font-bold tracking-tight text-gradient glow py-2 leading-relaxed">Portfolio Backtesting</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light tracking-wide leading-relaxed">
            Evaluate historical performance of your investment portfolio. Enter stock tickers, 
            allocate weights, and visualize returns over different time periods.
          </p>
        </header>

        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="animate-float">
            <TickerInput 
              assets={assets} 
              setAssets={setAssets} 
              onCalculate={handleCalculate}
              isLoading={isLoading}
            />
          </div>
          
          {(performance || isLoading) && (
            <div className="space-y-8 animate-float-delayed">
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
