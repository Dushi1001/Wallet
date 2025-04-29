import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/utils";

// Helper function to get crypto price (would be from API in real implementation)
const getCryptoPrice = (type: string) => {
  const prices = {
    bitcoin: 29537.42,
    ethereum: 2122.67,
    solana: 60.05,
    cardano: 0.45,
    polkadot: 5.68,
    binance: 287.32,
  };
  
  return prices[type.toLowerCase()] || 0;
};

// Sample historical data generator (in real implementation, this would come from an API)
const generateHistoricalData = (days: number = 30, trend: 'up' | 'down' | 'mixed' = 'mixed') => {
  const data = [];
  let baseValue = 42000;
  const volatility = 0.03;
  const trendFactor = trend === 'up' ? 0.01 : trend === 'down' ? -0.01 : 0;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility + trendFactor;
    baseValue = baseValue * (1 + change);
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: baseValue
    });
  }
  
  return data;
};

export default function PortfolioPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "1Y" | "ALL">("1M");
  
  // Fetch user wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });
  
  // Generate portfolio chart data (would be API call in real implementation)
  const { data: portfolioHistory } = useQuery({
    queryKey: ["/api/portfolio/history", timeRange],
    queryFn: () => {
      const days = timeRange === "1W" ? 7 : 
                 timeRange === "1M" ? 30 : 
                 timeRange === "3M" ? 90 : 
                 timeRange === "1Y" ? 365 : 730;
      return generateHistoricalData(days, 'up');
    },
    enabled: !!user,
  });
  
  // Calculate allocation data from wallets
  const allocationData = wallets?.map(wallet => {
    const price = getCryptoPrice(wallet.type);
    const value = wallet.balance * price;
    return {
      name: wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1),
      symbol: wallet.type.toUpperCase(),
      value: value,
    };
  }) || [];
  
  // Calculate total portfolio value
  const totalPortfolioValue = allocationData.reduce((sum, item) => sum + item.value, 0);
  
  // Add percentage to allocation data
  const allocationDataWithPercentage = allocationData.map(item => ({
    ...item,
    percentage: (item.value / totalPortfolioValue) * 100,
  }));
  
  // Colors for the pie chart
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  
  // Key portfolio metrics (would be calculated from real data in production)
  const portfolioMetrics = [
    { label: "Total Value", value: totalPortfolioValue, type: "currency" },
    { label: "24h Change", value: 4.32, type: "percentage", trend: "up" },
    { label: "7d Change", value: -1.23, type: "percentage", trend: "down" },
    { label: "30d Change", value: 12.45, type: "percentage", trend: "up" },
    { label: "Total Profit/Loss", value: 8734.21, type: "currency", trend: "up" },
    { label: "All-time ROI", value: 32.67, type: "percentage", trend: "up" },
  ];

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track and analyze your cryptocurrency investments</p>
        </div>
      </div>
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {portfolioMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <div className="flex items-center mt-1">
                  {isLoadingWallets ? (
                    <Skeleton className="h-7 w-32" />
                  ) : (
                    <>
                      <span className="text-2xl font-bold">
                        {metric.type === "currency" 
                          ? formatCurrency(metric.value) 
                          : formatPercentage(metric.value)}
                      </span>
                      {metric.trend && (
                        <span className={`ml-2 text-sm ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`inline-block w-4 h-4 ${metric.trend === "up" ? "" : "rotate-180"}`}
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Portfolio Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Portfolio Performance</CardTitle>
            <Tabs 
              value={timeRange} 
              onValueChange={(value) => setTimeRange(value as "1W" | "1M" | "3M" | "1Y" | "ALL")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="1W">1W</TabsTrigger>
                <TabsTrigger value="1M">1M</TabsTrigger>
                <TabsTrigger value="3M">3M</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
                <TabsTrigger value="ALL">ALL</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {isLoadingWallets ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Portfolio Value']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#portfolioGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex justify-center">
              {isLoadingWallets ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : allocationDataWithPercentage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationDataWithPercentage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      labelLine={false}
                    >
                      {allocationDataWithPercentage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), 'Value']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No assets found in your portfolio</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Composition</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingWallets ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : allocationDataWithPercentage.length > 0 ? (
              <div className="space-y-4">
                {allocationDataWithPercentage.map((asset, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{asset.name} ({asset.symbol})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(asset.value)}</div>
                      <div className="text-sm text-muted-foreground">{asset.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No assets found in your portfolio</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Investment Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Based on your current portfolio composition and market conditions, here are some recommended actions:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 12h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 6v2" />
                    <path d="M12 16v2" />
                  </svg>
                  <h3 className="font-medium">Diversify Your Portfolio</h3>
                </div>
                <p className="text-sm text-muted-foreground">Consider adding more altcoins to your portfolio to reduce overall risk and potentially increase returns.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <h3 className="font-medium">Dollar-Cost Averaging</h3>
                </div>
                <p className="text-sm text-muted-foreground">Set up regular purchases of Bitcoin and Ethereum to reduce the impact of volatility on your investment.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <h3 className="font-medium">Stake Your Crypto</h3>
                </div>
                <p className="text-sm text-muted-foreground">Consider staking your Cardano and Polkadot holdings to earn passive income while holding.</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg mt-6">
              <p className="text-sm font-medium mb-1">Investment Strategy Disclaimer</p>
              <p className="text-xs text-muted-foreground">
                These recommendations are provided for informational purposes only and do not constitute financial advice. 
                Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
