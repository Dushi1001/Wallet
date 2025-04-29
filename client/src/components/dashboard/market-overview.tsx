import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/ui/svg-icons";
import { formatCurrency, formatPercentage } from "@/lib/utils";

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
}

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
      {type === "polkadot" && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      )}
    </div>
  );
};

export default function MarketOverview() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Example market data for UI - in a real app, this would come from an API
  const { data: marketData, isLoading } = useQuery<CryptoAsset[]>({
    queryKey: ["/api/markets"],
    queryFn: async () => {
      // This would be a real API call in production
      return [
        { id: 1, name: "Bitcoin", symbol: "BTC", price: 30123.45, change24h: 2.34, change7d: 5.67, marketCap: 574.3e9, volume24h: 28.7e9, iconType: "bitcoin" },
        { id: 2, name: "Ethereum", symbol: "ETH", price: 1987.32, change24h: 3.56, change7d: -1.23, marketCap: 238.5e9, volume24h: 12.4e9, iconType: "ethereum" },
        { id: 3, name: "Solana", symbol: "SOL", price: 56.78, change24h: -2.41, change7d: 8.92, marketCap: 23.6e9, volume24h: 1.8e9, iconType: "solana" },
        { id: 4, name: "Cardano", symbol: "ADA", price: 0.42, change24h: 1.12, change7d: -3.57, marketCap: 14.8e9, volume24h: 423.5e6, iconType: "cardano" },
        { id: 5, name: "Polkadot", symbol: "DOT", price: 5.68, change24h: -0.87, change7d: 4.32, marketCap: 7.2e9, volume24h: 265.1e6, iconType: "polkadot" },
      ];
    },
    enabled: true,
  });

  // Filter market data based on search term
  const filteredMarketData = marketData?.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="overflow-hidden mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Market Overview</CardTitle>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              type="text"
              placeholder="Search assets..."
              className="w-[180px] py-1.5 pl-8 pr-3 text-sm rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button size="sm" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-1.5"
            >
              <path d="M3 3h18v18H3z" />
              <path d="M21 9H3" />
              <path d="M9 21V9" />
            </svg>
            <span>Watchlist</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">24h %</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">7d %</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Market Cap</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume (24h)</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : filteredMarketData && filteredMarketData.length > 0 ? (
                filteredMarketData.map((asset, index) => (
                  <tr key={asset.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap text-sm text-muted-foreground">{index + 1}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-${asset.iconType === 'bitcoin' ? 'yellow' : asset.iconType === 'ethereum' ? 'indigo' : asset.iconType === 'solana' ? 'purple' : asset.iconType === 'cardano' ? 'blue' : 'green'}-500/20 flex items-center justify-center mr-3`}>
                          <CryptoIcon type={asset.iconType} />
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right font-medium">{formatCurrency(asset.price)}</td>
                    <td className={`py-4 px-4 whitespace-nowrap text-right font-medium ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(asset.change24h)}
                    </td>
                    <td className={`py-4 px-4 whitespace-nowrap text-right font-medium ${asset.change7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(asset.change7d)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right text-sm text-foreground/80">
                      {asset.marketCap >= 1e12
                        ? `$${(asset.marketCap / 1e12).toFixed(1)}T`
                        : asset.marketCap >= 1e9
                        ? `$${(asset.marketCap / 1e9).toFixed(1)}B`
                        : `$${(asset.marketCap / 1e6).toFixed(1)}M`}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right text-sm text-foreground/80">
                      {asset.volume24h >= 1e12
                        ? `$${(asset.volume24h / 1e12).toFixed(1)}T`
                        : asset.volume24h >= 1e9
                        ? `$${(asset.volume24h / 1e9).toFixed(1)}B`
                        : `$${(asset.volume24h / 1e6).toFixed(1)}M`}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <Button size="sm" className="inline-flex items-center justify-center">
                        <span>Buy</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    {searchTerm ? "No assets found matching your search." : "No market data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
