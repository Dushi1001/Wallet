import { useSelector } from "react-redux";
import { useLocation } from "wouter";
import { RootState } from "@/store";
import Layout from "@/components/layout/Layout";
import { KycVerification } from "@/components/kyc/KycVerification";
import { Separator } from "@/components/ui/separator";

export default function KycVerificationPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to unlock all platform features
          </p>
        </div>
        
        <Separator />
        
        <KycVerification />
      </div>
    </Layout>
  );
}