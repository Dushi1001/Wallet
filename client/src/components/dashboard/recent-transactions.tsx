import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCryptoAmount, formatDateRelative, shortenAddress } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, RefreshIcon } from "@/components/ui/svg-icons";

export default function RecentTransactions() {
  const { user } = useAuth();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 5 }],
    enabled: !!user,
  });

  // Function to get icon based on transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "receive":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
            <ArrowDownIcon className="w-4 h-4 text-green-500" />
          </div>
        );
      case "send":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3 flex-shrink-0">
            <ArrowUpIcon className="w-4 h-4 text-red-500" />
          </div>
        );
      case "swap":
        return (
          <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center mr-3 flex-shrink-0">
            <RefreshIcon className="w-4 h-4 text-secondary-500" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
            <RefreshIcon className="w-4 h-4 text-primary" />
          </div>
        );
    }
  };

  // Function to get transaction title
  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "receive":
        return `Received ${transaction.cryptoSymbol}`;
      case "send":
        return `Sent ${transaction.cryptoSymbol}`;
      case "swap":
        return `Swapped for ${transaction.cryptoSymbol}`;
      default:
        return `${transaction.cryptoSymbol} Transaction`;
    }
  };

  // Function to get transaction amount with sign
  const getTransactionAmount = (transaction: Transaction) => {
    const sign = transaction.type === "receive" ? "+" : transaction.type === "send" ? "-" : "";
    return `${sign}${formatCryptoAmount(transaction.cryptoAmount)} ${transaction.cryptoSymbol}`;
  };

  // Function to get address display
  const getAddressDisplay = (transaction: Transaction) => {
    if (transaction.type === "receive" && transaction.fromAddress) {
      return `From: ${shortenAddress(transaction.fromAddress)}`;
    } else if (transaction.type === "send" && transaction.toAddress) {
      return `To: ${shortenAddress(transaction.toAddress)}`;
    } else if (transaction.type === "swap") {
      return transaction.hash ? shortenAddress(transaction.hash) : "Swap processed";
    } else {
      return transaction.status;
    }
  };

  // Function to get transaction amount color
  const getAmountColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case "receive":
        return "text-green-500";
      case "send":
        return "text-red-500";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Link href="/transactions">
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
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start">
                <Skeleton className="w-8 h-8 rounded-full mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start">
                {getTransactionIcon(transaction.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{getTransactionTitle(transaction)}</p>
                    <span className={`font-medium ${getAmountColor(transaction)}`}>
                      {getTransactionAmount(transaction)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {getAddressDisplay(transaction)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDateRelative(transaction.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No recent transactions found.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
