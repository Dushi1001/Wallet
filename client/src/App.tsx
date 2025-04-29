import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import WalletsPage from "@/pages/wallets-page";
import TransactionsPage from "@/pages/transactions-page";
import MarketsPage from "@/pages/markets-page";
import SwapPage from "@/pages/swap-page";
import PortfolioPage from "@/pages/portfolio-page";
import SettingsPage from "@/pages/settings-page";
import KycVerificationPage from "@/pages/kyc-verification-page";
import SupportFaqPage from "@/pages/support-faq-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/wallets" component={WalletsPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/markets" component={MarketsPage} />
      <ProtectedRoute path="/swap" component={SwapPage} />
      <ProtectedRoute path="/portfolio" component={PortfolioPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/kyc" component={KycVerificationPage} />
      <ProtectedRoute path="/support" component={SupportFaqPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
