import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Wallet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { ArrowUpIcon, ArrowDownIcon, RefreshIcon } from "@/components/ui/svg-icons";
import { formatCryptoAmount, formatDateRelative, shortenAddress } from "@/lib/utils";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: wallets, isLoading: isLoadingWallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: !!user,
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 100 }], // We'll handle pagination on client side for demo
    enabled: !!user,
  });
  
  // Filter transactions based on selected options
  const filteredTransactions = transactions?.filter(transaction => {
    const walletMatch = selectedWallet === "all" || 
      (transaction.walletId && transaction.walletId.toString() === selectedWallet);
    const typeMatch = selectedType === "all" || transaction.type === selectedType;
    return walletMatch && typeMatch;
  }) || [];
  
  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Function to get transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "receive":
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ArrowDownIcon className="w-4 h-4 text-green-500" />
          </div>
        );
      case "send":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <ArrowUpIcon className="w-4 h-4 text-red-500" />
          </div>
        );
      case "swap":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <RefreshIcon className="w-4 h-4 text-blue-500" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <RefreshIcon className="w-4 h-4 text-primary" />
          </div>
        );
    }
  };
  
  // Function to get wallet name by id
  const getWalletName = (walletId: number | null) => {
    if (!walletId) return "Unknown Wallet";
    const wallet = wallets?.find(w => w.id === walletId);
    return wallet ? wallet.name : "Unknown Wallet";
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and manage your cryptocurrency transactions</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Wallet</label>
          <Select 
            value={selectedWallet} 
            onValueChange={setSelectedWallet} 
            disabled={isLoadingWallets}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              {wallets?.map(wallet => (
                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Transaction Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="receive">Received</SelectItem>
              <SelectItem value="send">Sent</SelectItem>
              <SelectItem value="swap">Swapped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full max-w-[300px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type)}
                            <span className="ml-2 capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getWalletName(transaction.walletId)}</TableCell>
                        <TableCell className={`font-medium ${
                          transaction.type === 'receive' ? 'text-green-500' : 
                          transaction.type === 'send' ? 'text-red-500' : ''
                        }`}>
                          {transaction.type === 'receive' ? '+' : 
                           transaction.type === 'send' ? '-' : ''}
                          {formatCryptoAmount(transaction.cryptoAmount)} {transaction.cryptoSymbol}
                        </TableCell>
                        <TableCell>
                          {transaction.type === 'receive' && transaction.fromAddress 
                            ? `From: ${shortenAddress(transaction.fromAddress)}`
                            : transaction.type === 'send' && transaction.toAddress
                            ? `To: ${shortenAddress(transaction.toAddress)}`
                            : transaction.hash
                            ? shortenAddress(transaction.hash)
                            : '-'}
                        </TableCell>
                        <TableCell>{formatDateRelative(transaction.timestamp)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            transaction.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(p => Math.max(1, p - 1));
                        }}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(p => Math.min(totalPages, p + 1));
                        }}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-muted-foreground">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {selectedWallet !== "all" || selectedType !== "all" 
                  ? "Try changing your filters to see more results."
                  : "You don't have any transactions yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
