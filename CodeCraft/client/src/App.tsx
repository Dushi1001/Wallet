import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/AuthContext";
import Layout from "@/components/layout/Layout";

import DashboardPage from "@/pages/DashboardPage";
import PortfolioPage from "@/pages/PortfolioPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AdminPanel from "@/pages/admin";
import Support from "@/pages/support";
import NotFound from "@/pages/not-found";
import KycVerificationPage from "@/pages/kyc-verification";
import KycCompletePage from "@/pages/kyc-complete";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/wallet" component={DashboardPage} /> {/* Placeholder until Wallet page is created */}
      <Route path="/analytics" component={DashboardPage} /> {/* Placeholder until Analytics page is created */}
      <Route path="/market" component={PortfolioPage} /> {/* Placeholder until Market page is created */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/support" component={Support} />
      <Route path="/kyc-verification" component={KycVerificationPage} />
      <Route path="/kyc-complete" component={KycCompletePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
