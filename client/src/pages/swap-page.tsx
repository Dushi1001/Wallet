import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Wallet } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatCryptoAmount, formatCurrency } from "@/lib/utils";
import { RefreshIcon } from "@/components/ui/svg-icons";

// Helper functions
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

const getCryptoIcon = (type: string) => {
  const icons = {
    bitcoin: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 4 4 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
    ethereum: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    solana: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-500">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    cardano: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
        <circle cx="12" cy="12" r="10" />
        <path d="m8 14 2.5 2.5L16 10" />
      </svg>
    ),
    polkadot: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    binance: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-400">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M12 7v10M7 12h10" />
      </svg>
    ),
  };
  
  return icons[type.toLowerCase()] || icons.bitcoin;
};

export default function SwapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for swap form
  const [fromCrypto, setFromCrypto] = useState<string>("bitcoin");
  const [toCrypto, setToCrypto] = useState<string>("ethereum");
  const [fromAmount, setFromAmount] = useState<string>("0.01");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isConfirmingSwap, setIsConfirmingSwap] = useState<boolean>(false);
  
  // Fetch user wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });
  
  // Calculate exchange rate and result
  const fromPrice = getCryptoPrice(fromCrypto);
  const toPrice = getCryptoPrice(toCrypto);
  const exchangeRate = toPrice > 0 ? fromPrice / toPrice : 0;
  
  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const toAmount = (parsedFromAmount * exchangeRate).toFixed(8);
  
  // Calculate USD values
  const fromValueUSD = parsedFromAmount * fromPrice;
  const toValueUSD = parseFloat(toAmount) * toPrice;
  
  // Calculate fees (example - would be calculated properly in production)
  const networkFee = 0.0005; // Fixed fee in BTC
  const networkFeeUSD = networkFee * fromPrice;
  
  // Check if user has enough balance
  const fromWallet = wallets?.find(wallet => wallet.type.toLowerCase() === fromCrypto);
  const hasEnoughBalance = fromWallet ? fromWallet.balance >= parsedFromAmount : false;
  
  // Handle swap button click
  const handleSwapClick = () => {
    if (!hasEnoughBalance) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${fromCrypto.toUpperCase()} in your wallet.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsConfirmingSwap(true);
  };
  
  // Handle confirm swap
  const handleConfirmSwap = () => {
    // In a real app, this would call an API endpoint to perform the swap
    toast({
      title: "Swap successful",
      description: `Successfully swapped ${parsedFromAmount} ${fromCrypto.toUpperCase()} for ${toAmount} ${toCrypto.toUpperCase()}.`,
    });
    
    setIsConfirmingSwap(false);
    
    // Reset form
    setFromAmount("0.01");
  };
  
  // Handle currency flip
  const handleFlipCurrencies = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Swap</h1>
          <p className="text-muted-foreground mt-1">Exchange one cryptocurrency for another</p>
        </div>
      </div>
      
      <div className="max-w-xl mx-auto">
        {/* Swap Card */}
        <Card>
          <CardHeader>
            <CardTitle>Swap Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Currency */}
            <div className="space-y-3">
              <label className="text-sm font-medium">From</label>
              <div className="flex gap-3">
                <Select value={fromCrypto} onValueChange={setFromCrypto}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("bitcoin")}</div>
                        <span>Bitcoin (BTC)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ethereum">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("ethereum")}</div>
                        <span>Ethereum (ETH)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="solana">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("solana")}</div>
                        <span>Solana (SOL)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cardano">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("cardano")}</div>
                        <span>Cardano (ADA)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="polkadot">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("polkadot")}</div>
                        <span>Polkadot (DOT)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.0001"
                  />
                  {isLoadingWallets ? (
                    <div className="absolute -bottom-5 left-0">
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ) : fromWallet ? (
                    <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
                      Balance: {formatCryptoAmount(fromWallet.balance)} {fromCrypto.toUpperCase()}
                    </div>
                  ) : (
                    <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
                      No {fromCrypto.toUpperCase()} wallet found
                    </div>
                  )}
                  <div className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
                    {fromValueUSD > 0 ? formatCurrency(fromValueUSD) : "$0.00"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Swap Icon */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleFlipCurrencies}
                className="h-10 w-10 rounded-full bg-muted"
              >
                <RefreshIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* To Currency */}
            <div className="space-y-3">
              <label className="text-sm font-medium">To</label>
              <div className="flex gap-3">
                <Select value={toCrypto} onValueChange={setToCrypto}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("bitcoin")}</div>
                        <span>Bitcoin (BTC)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ethereum">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("ethereum")}</div>
                        <span>Ethereum (ETH)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="solana">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("solana")}</div>
                        <span>Solana (SOL)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cardano">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("cardano")}</div>
                        <span>Cardano (ADA)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="polkadot">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5">{getCryptoIcon("polkadot")}</div>
                        <span>Polkadot (DOT)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Input 
                    type="text" 
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="bg-muted"
                  />
                  <div className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
                    {toValueUSD > 0 ? formatCurrency(toValueUSD) : "$0.00"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Exchange Rate */}
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span>1 {fromCrypto.toUpperCase()} = {exchangeRate.toFixed(6)} {toCrypto.toUpperCase()}</span>
              </div>
            </div>
            
            {/* Slippage Settings */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Slippage Tolerance</label>
                <span className="text-sm">{slippage}%</span>
              </div>
              <Slider
                defaultValue={[0.5]}
                max={5}
                step={0.1}
                onValueChange={(values) => setSlippage(values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
            
            {/* Transaction Details */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{networkFee} {fromCrypto.toUpperCase()} ({formatCurrency(networkFeeUSD)})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum Received</span>
                <span>{(parseFloat(toAmount) * (1 - slippage / 100)).toFixed(8)} {toCrypto.toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isConfirmingSwap ? (
              <div className="space-y-4 w-full">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Confirm Swap</h3>
                  <p className="text-sm text-muted-foreground">Please review your transaction details</p>
                </div>
                
                <div className="flex justify-between bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6">{getCryptoIcon(fromCrypto)}</div>
                    <span>{parsedFromAmount} {fromCrypto.toUpperCase()}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6">{getCryptoIcon(toCrypto)}</div>
                    <span>{toAmount} {toCrypto.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsConfirmingSwap(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleConfirmSwap}
                  >
                    Confirm Swap
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleSwapClick}
                disabled={
                  !hasEnoughBalance || 
                  parsedFromAmount <= 0 || 
                  fromCrypto === toCrypto
                }
              >
                {!hasEnoughBalance
                  ? "Insufficient Balance"
                  : fromCrypto === toCrypto
                  ? "Select Different Currencies"
                  : "Swap Currencies"}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Swap Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Swap Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">Swapping cryptocurrencies allows you to exchange one digital asset for another without going through a traditional exchange process.</p>
            
            <div className="space-y-2">
              <h3 className="font-medium">Tips for swapping:</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Review the exchange rate before confirming your swap</li>
                <li>Be aware of network fees that apply to each transaction</li>
                <li>Adjust the slippage tolerance based on market volatility</li>
                <li>For large amounts, consider splitting into multiple smaller swaps</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
