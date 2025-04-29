import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Wallet } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioSummary() {
  const { user } = useAuth();
  
  const { data: wallets, isLoading: isLoadingWallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/transactions", { limit: 100 }],
    enabled: !!user,
  });
  
  // Calculate total balance
  const totalBalance = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
  
  // Calculate 24h change (this would normally come from an API)
  const dailyChange = totalBalance * 0.0432; // This is just a placeholder
  const dailyChangePercentage = 4.32; // This is just a placeholder
  
  // Calculate active wallets
  const connectedWallets = wallets?.filter(wallet => wallet.isConnected).length || 0;
  const totalWallets = wallets?.length || 0;
  
  // Calculate transactions count
  const transactionsCount = transactions?.length || 0;

  const summaryItems = [
    {
      title: "Total Balance",
      value: isLoadingWallets ? null : formatCurrency(totalBalance),
      subValue: "USD",
      change: dailyChangePercentage,
      progressPercentage: 75,
      progressColor: "bg-primary",
    },
    {
      title: "24h Change",
      value: isLoadingWallets ? null : formatCurrency(dailyChange),
      subValue: "USD",
      change: dailyChangePercentage,
      progressPercentage: 62,
      progressColor: dailyChangePercentage >= 0 ? "bg-green-500" : "bg-red-500",
    },
    {
      title: "Active Wallets",
      value: isLoadingWallets ? null : connectedWallets.toString(),
      subValue: `${totalWallets} Total`,
      badge: `${totalWallets} Total`,
      progressPercentage: totalWallets > 0 ? (connectedWallets / totalWallets) * 100 : 0,
      progressColor: "bg-secondary-500",
    },
    {
      title: "Total Transactions",
      value: isLoadingTransactions ? null : transactionsCount.toString(),
      subValue: "This Month",
      badge: "This Month",
      progressPercentage: 45,
      progressColor: "bg-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {summaryItems.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
            {item.change !== undefined ? (
              <span className={cn("flex items-center text-xs", item.change >= 0 ? "text-green-500" : "text-red-500")}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={cn("w-3 h-3 mr-1", item.change >= 0 ? "" : "rotate-180")}
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                {formatPercentage(item.change)}
              </span>
            ) : (
              item.badge && (
                <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary-foreground/90 rounded">
                  {item.badge}
                </span>
              )
            )}
          </div>
          <div className="flex items-baseline mb-1">
            {item.value ? (
              <span className="text-2xl font-bold">{item.value}</span>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
            {item.subValue && <span className="ml-2 text-xs text-muted-foreground">{item.subValue}</span>}
          </div>
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", item.progressColor)} 
              style={{ width: `${item.progressPercentage}%` }}
            ></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
