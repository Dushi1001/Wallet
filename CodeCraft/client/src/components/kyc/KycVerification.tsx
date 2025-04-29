import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileCheck, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// KYC status component displays the current status of KYC verification
const KycStatus = ({ status, submittedAt, verifiedAt }: { 
  status: string, 
  submittedAt?: string,
  verifiedAt?: string
}) => {
  let statusColor = "bg-gray-500";
  let statusIcon = <AlertCircle className="h-4 w-4" />;
  
  if (status === "verified") {
    statusColor = "bg-green-500";
    statusIcon = <CheckCircle className="h-4 w-4" />;
  } else if (status === "pending") {
    statusColor = "bg-yellow-500";
    statusIcon = <Loader2 className="h-4 w-4 animate-spin" />;
  } else if (status === "rejected") {
    statusColor = "bg-red-500";
    statusIcon = <AlertCircle className="h-4 w-4" />;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span>Verification Status:</span>
        <Badge className={statusColor}>
          <div className="flex items-center space-x-1">
            {statusIcon}
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
        </Badge>
      </div>
      {submittedAt && (
        <div className="text-sm text-gray-500">
          Submitted: {new Date(submittedAt).toLocaleDateString()}
        </div>
      )}
      {verifiedAt && (
        <div className="text-sm text-green-600">
          Verified: {new Date(verifiedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export function KycVerification() {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  
  // Use existing user data from Redux store
  const auth = useSelector((state: RootState) => state.auth);
  
  // Initialize email from user data if available
  useEffect(() => {
    if (auth?.user && 'email' in auth.user && auth.user.email) {
      setEmail(auth.user.email as string);
    }
  }, [auth?.user]);
  
  // Define KYC status type
  type KycStatusResponse = {
    status: string;
    submittedAt?: string;
    verifiedAt?: string;
    rejectionReason?: string;
    details?: Record<string, any>;
  };

  // Query to fetch current KYC status
  const { data: kycStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery<KycStatusResponse>({
    queryKey: ['/api/kyc/status'],
    refetchInterval: (query) => {
      // Poll more frequently if status is pending
      return query.state.data?.status === 'pending' ? 30000 : false;
    }
  });
  
  // Mutation to initiate KYC verification
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!firstName || !lastName || !email) {
        throw new Error("Please fill in all required fields");
      }
      
      const response = await apiRequest('POST', '/api/kyc/initiate', {
        firstName,
        lastName,
        email,
        phone: phone || undefined
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      // Store verification URL to be used for redirect
      if (data && data.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
        
        toast({
          title: "KYC Verification Initiated",
          description: "You will be redirected to the verification page.",
        });
        
        // Invalidate KYC status to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
        refetchStatus();
      } else {
        toast({
          title: "Error",
          description: "Failed to get verification URL",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate KYC verification",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };
  
  // Handle redirect to Sunbase verification page
  const handleProceed = () => {
    if (verificationUrl) {
      window.location.href = verificationUrl;
    }
  };
  
  // Show loading state while fetching KYC status
  if (isLoadingStatus) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Loading your verification status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  // If the user has already submitted KYC, show the status
  if (kycStatus && kycStatus.status !== "not_submitted") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification Status</CardTitle>
          <CardDescription>Your identity verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <KycStatus 
            status={kycStatus.status} 
            submittedAt={kycStatus.submittedAt}
            verifiedAt={kycStatus.verifiedAt}
          />
          
          {kycStatus.status === "rejected" && (
            <Alert className="mt-4 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                {kycStatus.rejectionReason || "Your verification was rejected. Please try again or contact support."}
              </AlertDescription>
            </Alert>
          )}
          
          {kycStatus.status === "pending" && (
            <Alert className="mt-4">
              <AlertTitle>Verification in Progress</AlertTitle>
              <AlertDescription>
                Your identity verification is being processed. This may take up to 24 hours.
              </AlertDescription>
            </Alert>
          )}
          
          {kycStatus.status === "verified" && (
            <Alert className="mt-4 border-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Verification Complete</AlertTitle>
              <AlertDescription>
                Your identity has been successfully verified. You now have full access to all platform features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          {kycStatus.status === "rejected" && (
            <Button onClick={() => setVerificationUrl(null)}>
              Retry Verification
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // If verification URL is available, show the redirect prompt
  if (verificationUrl) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Ready to verify your identity</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <FileCheck className="h-4 w-4" />
            <AlertTitle>Verification Ready</AlertTitle>
            <AlertDescription>
              You will be redirected to our secure verification partner to complete your identity verification.
              Please have your government-issued ID ready.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setVerificationUrl(null)}>
            Cancel
          </Button>
          <Button onClick={handleProceed}>
            Proceed to Verification
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Otherwise, show the KYC initiation form
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          To comply with regulations and secure your account, we need to verify your identity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name*</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name*</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please provide accurate information that matches your government ID.
              Incorrect information may cause verification to fail.
            </AlertDescription>
          </Alert>
          
          <div className="border-t pt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating Verification...
                </>
              ) : (
                "Start Verification Process"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}