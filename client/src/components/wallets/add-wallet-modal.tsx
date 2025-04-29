import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InsertWallet } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloseIcon } from "@/components/ui/svg-icons";

interface AddWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddWalletModal({ open, onOpenChange }: AddWalletModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState("bitcoin");
  const [walletAddress, setWalletAddress] = useState("");
  const [connectOption, setConnectOption] = useState<"connect" | "create" | null>(null);

  const createWalletMutation = useMutation({
    mutationFn: async (walletData: Omit<InsertWallet, "userId">) => {
      const response = await apiRequest("POST", "/api/wallets", {
        ...walletData,
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet added successfully",
        description: "Your new wallet has been added to your account."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add wallet",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setWalletName("");
    setWalletType("bitcoin");
    setWalletAddress("");
    setConnectOption(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletName) {
      toast({
        title: "Wallet name required",
        description: "Please provide a name for your wallet.",
        variant: "destructive"
      });
      return;
    }

    createWalletMutation.mutate({
      name: walletName,
      type: walletType as any,
      address: walletAddress || undefined,
      isConnected: connectOption === "connect"
    });
  };

  const handleClose = () => {
    if (!createWalletMutation.isPending) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Wallet</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
            <CloseIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button
              type="button"
              variant={connectOption === "connect" ? "default" : "outline"}
              className="flex flex-col items-center justify-center p-4 h-auto"
              onClick={() => setConnectOption("connect")}
            >
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <span className="font-medium">Connect Wallet</span>
              <span className="text-xs text-muted-foreground mt-1">Use existing wallet</span>
            </Button>
            
            <Button
              type="button"
              variant={connectOption === "create" ? "default" : "outline"}
              className="flex flex-col items-center justify-center p-4 h-auto"
              onClick={() => setConnectOption("create")}
            >
              <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <span className="font-medium">Create Wallet</span>
              <span className="text-xs text-muted-foreground mt-1">Generate new wallet</span>
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="wallet-name">Wallet Name</Label>
              <Input
                id="wallet-name"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="Enter a name for your wallet"
              />
            </div>
            
            <div>
              <Label htmlFor="wallet-type">Cryptocurrency</Label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger id="wallet-type">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="solana">Solana (SOL)</SelectItem>
                  <SelectItem value="cardano">Cardano (ADA)</SelectItem>
                  <SelectItem value="polkadot">Polkadot (DOT)</SelectItem>
                  <SelectItem value="binance">Binance Coin (BNB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="wallet-address">Wallet Address (Optional)</Label>
              <div className="relative">
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon" 
                  className="absolute inset-y-0 right-0 h-full"
                  title="Scan QR code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <rect x="7" y="7" width="3" height="3" />
                    <rect x="14" y="7" width="3" height="3" />
                    <rect x="7" y="14" width="3" height="3" />
                    <rect x="14" y="14" width="3" height="3" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={handleClose} disabled={createWalletMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWalletMutation.isPending}>
              {createWalletMutation.isPending ? "Adding..." : "Add Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
