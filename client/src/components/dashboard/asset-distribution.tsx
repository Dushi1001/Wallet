import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Interface for asset distribution data
interface Asset {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color: string;
}

// Sample data (would come from API in real implementation)
const sampleAssetData: Asset[] = [
  { name: "Bitcoin", symbol: "BTC", value: 19125.75, percentage: 42.5, color: "hsl(var(--chart-1))" },
  { name: "Ethereum", symbol: "ETH", value: 12735.08, percentage: 28.3, color: "hsl(var(--chart-2))" },
  { name: "Solana", symbol: "SOL", value: 6848.03, percentage: 15.2, color: "hsl(var(--chart-3))" },
  { name: "Cardano", symbol: "ADA", value: 3917.76, percentage: 8.7, color: "hsl(var(--chart-4))" },
  { name: "Others", symbol: "", value: 2385.83, percentage: 5.3, color: "hsl(var(--chart-5))" },
];

export default function AssetDistribution() {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/portfolio/assets"],
    queryFn: () => Promise.resolve(sampleAssetData), // Replace with actual API call
    enabled: !!user,
  });

  // Reset selected asset when data changes
  useEffect(() => {
    setSelectedAsset(null);
  }, [assets]);

  // Calculate total percentage
  const totalPercentage = assets?.reduce((sum, asset) => sum + asset.percentage, 0) || 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover p-2 border border-border rounded-md shadow-md">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-xs text-muted-foreground">{data.symbol}</p>
          <p className="text-sm font-medium text-foreground">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (data: any, index: number) => {
    if (data && data.payload) {
      setSelectedAsset(data.payload);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Asset Distribution</h2>
      </div>
      
      {/* Donut Chart */}
      <div className="relative mx-auto w-[180px] h-[180px] mb-6">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-full" />
        ) : assets ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assets}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="percentage"
                  onClick={handlePieClick}
                  cursor="pointer"
                >
                  {assets.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={selectedAsset === entry ? 'hsl(var(--foreground))' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Percentage in Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="block text-xl font-bold">
                  {selectedAsset ? 
                    `${selectedAsset.percentage.toFixed(1)}%` : 
                    `${totalPercentage}%`
                  }
                </span>
                <span className="block text-xs text-muted-foreground">
                  {selectedAsset ? selectedAsset.symbol : 'Allocated'}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
      
      {/* Asset List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : assets ? (
          assets.map((asset, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedAsset(asset === selectedAsset ? null : asset)}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: asset.color }}
                ></div>
                <span className={`text-sm ${selectedAsset === asset ? 'font-semibold' : ''}`}>
                  {asset.name} {asset.symbol ? `(${asset.symbol})` : ''}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className={`text-sm ${selectedAsset === asset ? 'font-semibold' : ''}`}>
                  {asset.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        ) : null}
      </div>
    </Card>
  );
}
