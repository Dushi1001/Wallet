import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function KycCompletePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get KYC ID from URL parameters
  const params = new URLSearchParams(window.location.search);
  const kycId = params.get('kyc_id');
  const success = params.get('success') === 'true';
  
  // Define KYC status type
  type KycStatusResponse = {
    status: string;
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    details?: Record<string, any>;
  };

  // Fetch latest KYC status
  const { isLoading, data } = useQuery<KycStatusResponse>({
    queryKey: ['/api/kyc/status'],
    refetchInterval: (query) => query.state.data?.status === 'pending' ? 5000 : false,
  });
  
  useEffect(() => {
    // Invalidate KYC status in cache to trigger a fresh fetch
    queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
    
    // Handle error case
    if (!success && kycId) {
      setStatus('error');
      setError('Verification was not completed successfully. Please try again.');
    }
  }, [kycId, success, queryClient]);
  
  const handleDashboard = () => {
    setLocation('/dashboard');
  };
  
  const handleRetry = () => {
    setLocation('/kyc-verification');
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Processing Verification</CardTitle>
              <CardDescription>Please wait while we update your verification status...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Verification succeeded
  if (data?.status === 'verified') {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex justify-center items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span>Verification Complete</span>
              </CardTitle>
              <CardDescription>Your identity has been successfully verified</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-500">
                <AlertTitle>Account Fully Verified</AlertTitle>
                <AlertDescription>
                  Congratulations! Your account is now fully verified. You have access to all features of our platform.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleDashboard}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Verification is pending
  if (data?.status === 'pending') {
    return (
      <Layout>
        <div className="container py-10 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Verification In Progress</CardTitle>
              <CardDescription>Your verification is being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Processing</AlertTitle>
                <AlertDescription>
                  Your identity verification is being reviewed. This process typically takes 1-24 hours.
                  You'll receive an email notification once the verification is complete.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleDashboard}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Verification failed or error
  return (
    <Layout>
      <div className="container py-10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex justify-center items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span>Verification Issue</span>
            </CardTitle>
            <CardDescription>
              {data?.status === 'rejected' 
                ? 'Your verification was not approved'
                : 'There was a problem with the verification process'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>
                {data?.status === 'rejected' ? 'Verification Rejected' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {data?.status === 'rejected' 
                  ? (data.rejectionReason || 'Your identity verification could not be completed. Please try again with clearer documents.') 
                  : (error || 'Something went wrong with the verification process. Please try again.')}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleDashboard}>
              Go to Dashboard
            </Button>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}