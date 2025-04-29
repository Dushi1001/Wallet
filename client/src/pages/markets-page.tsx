import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, PlusIcon } from "@/components/ui/svg-icons";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CryptoAsset {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  iconType: string;
  isWatchlisted?: boolean;
}

// Sample crypto data (would come from API in real implementation)
const sampleCryptoData: CryptoAsset[] = [
  { id: 1, name: "Bitcoin", symbol: "BTC", price: 30123.45, change24h: 2.34, change7d: 5.67, marketCap: 574.3e9, volume24h: 28.7e9, iconType: "bitcoin" },
  { id: 2, name: "Ethereum", symbol: "ETH", price: 1987.32, change24h: 3.56, change7d: -1.23, marketCap: 238.5e9, volume24h: 12.4e9, iconType: "ethereum" },
  { id: 3, name: "Solana", symbol: "SOL", price: 56.78, change24h: -2.41, change7d: 8.92, marketCap: 23.6e9, volume24h: 1.8e9, iconType: "solana" },
  { id: 4, name: "Cardano", symbol: "ADA", price: 0.42, change24h: 1.12, change7d: -3.57, marketCap: 14.8e9, volume24h: 423.5e6, iconType: "cardano" },
  { id: 5, name: "Polkadot", symbol: "DOT", price: 5.68, change24h: -0.87, change7d: 4.32, marketCap: 7.2e9, volume24h: 265.1e6, iconType: "polkadot" },
  { id: 6, name: "Binance Coin", symbol: "BNB", price: 287.32, change24h: 0.45, change7d: -2.18, marketCap: 44.1e9, volume24h: 872.5e6, iconType: "binance" },
  { id: 7, name: "XRP", symbol: "XRP", price: 0.58, change24h: -1.23, change7d: 3.45, marketCap: 29.6e9, volume24h: 934.7e6, iconType: "xrp" },
  { id: 8, name: "Avalanche", symbol: "AVAX", price: 22.48, change24h: 4.67, change7d: 12.34, marketCap: 8.2e9, volume24h: 345.2e6, iconType: "avalanche" },
  { id: 9, name: "Dogecoin", symbol: "DOGE", price: 0.078, change24h: 1.45, change7d: -5.67, marketCap: 10.5e9, volume24h: 612.3e6, iconType: "dogecoin" },
  { id: 10, name: "Chainlink", symbol: "LINK", price: 14.23, change24h: 2.89, change7d: 7.43, marketCap: 7.8e9, volume24h: 234.5e6, iconType: "chainlink" },
];

// Sample watchlist data
const sampleWatchlistData: CryptoAsset[] = [
  { ...sampleCryptoData[0], isWatchlisted: true },
  { ...sampleCryptoData[1], isWatchlisted: true },
  { ...sampleCryptoData[2], isWatchlisted: true },
];

// Sample chart data generator
const generateChartData = (days: number, trend: 'up' | 'down' | 'mixed' = 'mixed') => {
  const data = [];
  let baseValue = 10000;
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

// Icons for different cryptocurrencies
const CryptoIcon = ({ type, className }: { type: string; className?: string }) => {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${className || ""}`}>
      {type === "bitcoin" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 4 4 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      )}
      {type === "ethereum" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )}
      {type === "solana" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )}
      {type === "cardano" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
          <circle cx="12" cy="12" r="10" />
          <path d="m8 14 2.5 2.5L16 10" />
        </svg>
      )}
      {(type === "polkadot" || type === "default") && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )}
    </div>
  );
};

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [watchlist, setWatchlist] = useState<CryptoAsset[]>(sampleWatchlistData);
  
  const { data: marketData, isLoading } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/markets"],
    queryFn: async () => {
      // This would be a real API call in production
      return sampleCryptoData;
    },
    enabled: true,
  });
  
  const { data: chartData } = useQuery({
    queryKey: ["/api/markets/chart"],
    queryFn: () => {
      return generateChartData(30, 'up');
    },
  });
  
  // Filter market data based on search term
  const filteredMarketData = marketData?.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleWatchlist = (asset: CryptoAsset) => {
    if (watchlist.some(item => item.id === asset.id)) {
      setWatchlist(watchlist.filter(item => item.id !== asset.id));
    } else {
      setWatchlist([...watchlist, { ...asset, isWatchlisted: true }]);
    }
  };
  
  const displayData = activeTab === "watchlist" ? watchlist : filteredMarketData;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Markets</h1>
          <p className="text-muted-foreground mt-1">Browse and track cryptocurrency markets</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-[250px]"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* Market Overview Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => formatCurrency(value, "USD", 0)}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Market Cap"]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Crypto Assets Table */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <CardTitle>Cryptocurrency Markets</CardTitle>
              <TabsList>
                <TabsTrigger value="all">All Assets</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">24h %</TableHead>
                  <TableHead className="text-right">7d %</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">Volume (24h)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Skeleton className="h-8 w-8 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                ) : displayData && displayData.length > 0 ? (
                  displayData.map((asset, index) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full bg-${asset.iconType === 'bitcoin' ? 'yellow' : asset.iconType === 'ethereum' ? 'indigo' : asset.iconType === 'solana' ? 'purple' : asset.iconType === 'cardano' ? 'blue' : 'green'}-500/20 flex items-center justify-center mr-3`}>
                            <CryptoIcon type={asset.iconType} />
                          </div>
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(asset.price)}</TableCell>
                      <TableCell className={`text-right font-medium ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(asset.change24h)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${asset.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(asset.change7d)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {asset.marketCap >= 1e12
                          ? `$${(asset.marketCap / 1e12).toFixed(1)}T`
                          : asset.marketCap >= 1e9
                          ? `$${(asset.marketCap / 1e9).toFixed(1)}B`
                          : `$${(asset.marketCap / 1e6).toFixed(1)}M`}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {asset.volume24h >= 1e12
                          ? `$${(asset.volume24h / 1e12).toFixed(1)}T`
                          : asset.volume24h >= 1e9
                          ? `$${(asset.volume24h / 1e9).toFixed(1)}B`
                          : `$${(asset.volume24h / 1e6).toFixed(1)}M`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleWatchlist(asset)}
                          >
                            {watchlist.some(item => item.id === asset.id) ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            )}
                            {watchlist.some(item => item.id === asset.id) ? 'Watchlisted' : 'Watchlist'}
                          </Button>
                          <Button size="sm">Buy</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      {activeTab === "watchlist" ? (
                        <>
                          <div className="flex items-center justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-muted-foreground">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          </div>
                          <p className="text-muted-foreground mb-2">Your watchlist is empty</p>
                          <p className="text-sm text-muted-foreground mb-4">Add cryptocurrencies to your watchlist to track their performance</p>
                          <Button variant="outline" onClick={() => setActiveTab("all")}>
                            Browse Assets
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">No assets found matching your search.</p>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
