
import { useState } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  CandlestickChart,
  BarChart3,
  PercentCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioAsset } from "@/utils/portfolioCalculations";

interface TickerInputProps {
  assets: PortfolioAsset[];
  setAssets: (assets: PortfolioAsset[]) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export function TickerInput({ assets, setAssets, onCalculate, isLoading }: TickerInputProps) {
  const [newTicker, setNewTicker] = useState("");
  const [newWeight, setNewWeight] = useState<number | "">("");
  
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  const remainingWeight = 100 - totalWeight;
  
  const handleAddTicker = () => {
    // Input validation
    if (!newTicker) {
      toast({
        title: "Error",
        description: "Please enter a ticker symbol",
        variant: "destructive",
      });
      return;
    }
    
    // Check if ticker already exists
    if (assets.some(a => a.ticker.toLowerCase() === newTicker.toLowerCase())) {
      toast({
        title: "Error",
        description: "This ticker is already in your portfolio",
        variant: "destructive",
      });
      return;
    }
    
    // Weight validation
    if (newWeight === "" || isNaN(Number(newWeight)) || Number(newWeight) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    // Check if total weight would exceed 100%
    if (totalWeight + Number(newWeight) > 100) {
      toast({
        title: "Error",
        description: `Weight too high. Remaining allocation: ${remainingWeight.toFixed(2)}%`,
        variant: "destructive",
      });
      return;
    }
    
    // Add new ticker
    setAssets([
      ...assets,
      { ticker: newTicker.toUpperCase(), weight: Number(newWeight) }
    ]);
    
    // Reset input fields
    setNewTicker("");
    setNewWeight("");
  };
  
  const handleRemoveTicker = (tickerToRemove: string) => {
    setAssets(assets.filter(asset => asset.ticker !== tickerToRemove));
  };
  
  const handleUpdateWeight = (ticker: string, newWeight: number) => {
    // Calculate what the total weight would be after update
    const otherAssetsWeight = assets
      .filter(a => a.ticker !== ticker)
      .reduce((sum, a) => sum + a.weight, 0);
      
    if (otherAssetsWeight + newWeight > 100) {
      toast({
        title: "Error",
        description: "Total weight cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }
    
    setAssets(
      assets.map(asset => 
        asset.ticker === ticker 
          ? { ...asset, weight: newWeight } 
          : asset
      )
    );
  };
  
  const handleRebalance = () => {
    if (assets.length === 0) return;
    
    // Equal weights for all assets
    const equalWeight = 100 / assets.length;
    
    setAssets(
      assets.map(asset => ({ ...asset, weight: Number(equalWeight.toFixed(2)) }))
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTicker();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="glassmorphism">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CandlestickChart className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Portfolio Assets</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-mono">
                Total: {totalWeight.toFixed(2)}%
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRebalance}
                disabled={assets.length === 0}
                className="group transition-all duration-300"
              >
                <PercentCircle className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" />
                Rebalance
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <div 
                key={asset.ticker} 
                className="flex items-center space-x-1 bg-secondary px-2.5 py-1 rounded-lg border border-border smooth-transition hover:bg-secondary/80"
              >
                <span className="font-mono font-medium">{asset.ticker}</span>
                <span className="text-xs text-muted-foreground">
                  <Input
                    type="number"
                    value={asset.weight}
                    onChange={(e) => handleUpdateWeight(asset.ticker, Number(e.target.value))}
                    className="w-16 h-6 text-xs p-1 inline-block"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                  %
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => handleRemoveTicker(asset.ticker)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-grow">
              <div className="relative">
                <BarChart3 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Add ticker (e.g., AAPL)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="pl-8"
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Weight %"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                max={100}
                step={0.1}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button 
              onClick={handleAddTicker} 
              className="transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <Button 
            onClick={onCalculate} 
            disabled={assets.length === 0 || Math.abs(totalWeight - 100) > 0.01 || isLoading}
            className="w-full transition-all duration-300"
          >
            {isLoading ? "Calculating..." : "Calculate Portfolio Performance"}
          </Button>
          
          {Math.abs(totalWeight - 100) > 0.01 && (
            <p className="text-sm text-destructive">
              Total weight must equal 100% (current: {totalWeight.toFixed(2)}%)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
