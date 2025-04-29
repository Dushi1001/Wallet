import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Wallet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import AddWalletModal from "@/components/wallets/add-wallet-modal";
import { formatCurrency, formatCryptoAmount } from "@/lib/utils";
import { 
  BitcoinIcon, 
  EthereumIcon, 
  SolanaIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  RefreshIcon, 
  PlusIcon 
} from "@/components/ui/svg-icons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

export default function WalletsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
  
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
  
  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: number) => {
      await apiRequest("DELETE", `/api/wallets/${walletId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Wallet removed",
        description: "The wallet has been successfully removed from your account.",
      });
      setWalletToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error removing wallet",
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
  
  const handleDeleteWallet = (wallet: Wallet) => {
    setWalletToDelete(wallet);
  };
  
  const confirmDeleteWallet = () => {
    if (walletToDelete) {
      deleteWalletMutation.mutate(walletToDelete.id);
    }
  };

  // Calculate total balance in USD
  const totalBalance = wallets?.reduce((sum, wallet) => {
    const price = getCryptoPrice(wallet.type);
    return sum + (wallet.balance * price);
  }, 0) || 0;

  // Get count of connected wallets
  const connectedWallets = wallets?.filter(wallet => wallet.isConnected).length || 0;

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground mt-1">Manage your cryptocurrency wallets</p>
        </div>
        
        <Button
          onClick={() => setIsAddWalletOpen(true)}
          className="inline-flex items-center justify-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Add New Wallet</span>
        </Button>
      </div>
      
      {/* Wallets Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M22 10H2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M10 22V2M22 10H2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallets</p>
                <p className="text-2xl font-bold">{connectedWallets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Wallets List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="w-12 h-12 rounded-full mr-4" />
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
                  
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : wallets && wallets.length > 0 ? (
            <div className="space-y-4">
              {wallets.map((wallet) => {
                const IconComponent = getWalletIcon(wallet.type);
                const cryptoPrice = getCryptoPrice(wallet.type);
                const fiatValue = wallet.balance * cryptoPrice;
                
                return (
                  <div key={wallet.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-lg">{wallet.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {wallet.isConnected ? 'Connected' : 'Not connected'} • {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                            {wallet.address ? ` • ${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-lg">
                          {formatCryptoAmount(wallet.balance)} {wallet.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(fiatValue)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        className="flex items-center justify-center"
                        onClick={() => handleReceive(wallet)}
                        disabled={updateBalanceMutation.isPending}
                      >
                        <ArrowDownIcon className="w-4 h-4 mr-2" />
                        <span>Receive</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center"
                        onClick={() => handleSend(wallet)}
                        disabled={updateBalanceMutation.isPending || wallet.balance <= 0}
                      >
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        <span>Send</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center"
                        onClick={() => handleSwap(wallet)}
                        disabled={updateBalanceMutation.isPending || wallet.balance <= 0}
                      >
                        <RefreshIcon className="w-4 h-4 mr-2" />
                        <span>Swap</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" className="w-full">More Options</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Feature not implemented",
                                description: "Wallet export functionality would go here in a production app."
                              });
                            }}
                          >
                            Export Private Key
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Feature not implemented",
                                description: "Wallet connection functionality would go here in a production app."
                              });
                            }}
                          >
                            {wallet.isConnected ? "Disconnect Wallet" : "Connect Wallet"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWallet(wallet)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete Wallet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-muted-foreground">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M14 12h2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No wallets found</h3>
              <p className="text-muted-foreground mb-6">You don't have any wallets yet. Add a wallet to get started.</p>
              <Button
                onClick={() => setIsAddWalletOpen(true)}
                className="inline-flex items-center justify-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                <span>Add New Wallet</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Wallet Modal */}
      <AddWalletModal open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen} />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!walletToDelete} onOpenChange={(open) => !open && setWalletToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the wallet "{walletToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWallet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteWalletMutation.isPending ? "Deleting..." : "Delete Wallet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
