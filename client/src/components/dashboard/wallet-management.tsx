import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Wallet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import AddWalletModal from "@/components/wallets/add-wallet-modal";
import { formatCurrency, formatCryptoAmount } from "@/lib/utils";
import { BitcoinIcon, EthereumIcon, SolanaIcon, ArrowUpIcon, ArrowDownIcon, RefreshIcon, PlusIcon } from "@/components/ui/svg-icons";

// Helper function to get icon by wallet type
const getWalletIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'bitcoin':
      return BitcoinIcon;
    case 'ethereum':
      return EthereumIcon;
    case 'solana':
      return SolanaIcon;
    default:
      return BitcoinIcon;
  }
};

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

export default function WalletManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  
  const { data: wallets, isLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });
  
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ walletId, newBalance }: { walletId: number, newBalance: number }) => {
      const response = await apiRequest("PUT", `/api/wallets/${walletId}`, { balance: newBalance });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Balance updated",
        description: "Your wallet balance has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating balance",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleReceive = (wallet: Wallet) => {
    // In a real implementation, this would show a receive modal with QR code
    // For demo, we'll just update the balance with a random amount
    const amount = Math.random() * 0.02;
    updateBalanceMutation.mutate({ 
      walletId: wallet.id, 
      newBalance: wallet.balance + amount
    });
  };
  
  const handleSend = (wallet: Wallet) => {
    // In a real implementation, this would show a send modal
    // For demo, we'll just update the balance with a random amount if sufficient funds
    if (wallet.balance > 0.01) {
      const amount = Math.min(wallet.balance * 0.1, Math.random() * 0.01);
      updateBalanceMutation.mutate({ 
        walletId: wallet.id, 
        newBalance: wallet.balance - amount
      });
    } else {
      toast({
        title: "Insufficient funds",
        description: "Your wallet balance is too low to send.",
        variant: "destructive",
      });
    }
  };
  
  const handleSwap = (wallet: Wallet) => {
    // In a real implementation, this would redirect to swap page
    toast({
      title: "Swap not implemented",
      description: "In a real app, this would redirect to the swap page.",
    });
  };

  return (
    <>
      <div className="xl:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Wallet Management</h2>
          <Link href="/wallets">
            <Button variant="link" className="text-sm font-medium text-primary">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </Link>
        </div>
        
        <div className="divide-y divide-border">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="w-10 h-10 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          ) : wallets && wallets.length > 0 ? (
            wallets.map((wallet) => {
              const IconComponent = getWalletIcon(wallet.type);
              const cryptoPrice = getCryptoPrice(wallet.type);
              const fiatValue = wallet.balance * cryptoPrice;
              
              return (
                <div key={wallet.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mr-4">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.isConnected ? 'Connected' : 'Not connected'} • {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">
                        {formatCryptoAmount(wallet.balance)} {wallet.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(fiatValue)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center justify-center"
                      onClick={() => handleReceive(wallet)}
                      disabled={updateBalanceMutation.isPending}
                    >
                      <ArrowDownIcon className="w-4 h-4 mr-2" />
                      <span>Receive</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center justify-center"
                      onClick={() => handleSend(wallet)}
                      disabled={updateBalanceMutation.isPending || wallet.balance <= 0}
                    >
                      <ArrowUpIcon className="w-4 h-4 mr-2" />
                      <span>Send</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center justify-center"
                      onClick={() => handleSwap(wallet)}
                      disabled={updateBalanceMutation.isPending || wallet.balance <= 0}
                    >
                      <RefreshIcon className="w-4 h-4 mr-2" />
                      <span>Swap</span>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No wallets found. Add a wallet to get started.</p>
            </div>
          )}
          
          {/* Add New Wallet (Always visible) */}
          <div className="p-6 flex items-center justify-center">
            <Button
              variant="outline"
              className="flex items-center justify-center"
              onClick={() => setIsAddWalletOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Add New Wallet</span>
            </Button>
          </div>
        </div>
      </div>
      
      <AddWalletModal open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen} />
    </>
  );
}
