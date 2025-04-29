import AppLayout from "@/components/layout/app-layout";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AssetDistribution from "@/components/dashboard/asset-distribution";
import WalletManagement from "@/components/dashboard/wallet-management";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import MarketOverview from "@/components/dashboard/market-overview";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { MoonIcon, SunIcon, RefreshIcon, PlusIcon } from "@/components/ui/svg-icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import AddWalletModal from "@/components/wallets/add-wallet-modal";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/wallets'] }),
        queryClient.refetchQueries({ queryKey: ['/api/transactions'] }),
        queryClient.refetchQueries({ queryKey: ['/api/portfolio/chart'] }),
        queryClient.refetchQueries({ queryKey: ['/api/portfolio/assets'] }),
        queryClient.refetchQueries({ queryKey: ['/api/markets'] })
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppLayout>
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your cryptocurrency portfolio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center justify-center"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <>
                <MoonIcon className="w-4 h-4 mr-2" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <SunIcon className="w-4 h-4 mr-2" />
                <span>Light Mode</span>
              </>
            )}
          </Button>
          
          {/* Add Wallet Button */}
          <Button
            size="sm"
            className="inline-flex items-center justify-center"
            onClick={() => setIsAddWalletOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Add Wallet</span>
          </Button>
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center justify-center"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <PortfolioSummary />
      
      {/* Portfolio Chart & Assets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <PortfolioChart />
        <AssetDistribution />
      </div>
      
      {/* Wallet Management & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <WalletManagement />
        <RecentTransactions />
      </div>
      
      {/* Market Overview */}
      <MarketOverview />
      
      {/* Add Wallet Modal */}
      <AddWalletModal open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen} />
    </AppLayout>
  );
}
