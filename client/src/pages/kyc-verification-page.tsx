import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KycVerification } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function KycVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for KYC form
  const [idType, setIdType] = useState<string>("passport");
  const [idNumber, setIdNumber] = useState<string>("");
  const [idExpiryDay, setIdExpiryDay] = useState<string>("");
  const [idExpiryMonth, setIdExpiryMonth] = useState<string>("");
  const [idExpiryYear, setIdExpiryYear] = useState<string>("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  
  // Fetch KYC status
  const { data: kycData, isLoading: isLoadingKyc } = useQuery<KycVerification>({
    queryKey: ["/api/kyc"],
    enabled: !!user,
  });
  
  // Create KYC verification mutation
  const submitKycMutation = useMutation({
    mutationFn: async (kycData: any) => {
      const response = await apiRequest("POST", "/api/kyc", kycData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "KYC submitted successfully",
        description: "Your verification documents have been submitted for review.",
      });
      
      // Reset form
      setIdNumber("");
      setIdExpiryDay("");
      setIdExpiryMonth("");
      setIdExpiryYear("");
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit KYC",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };
  
  // Handle KYC form submission
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!idNumber) {
      toast({
        title: "Missing information",
        description: "Please enter your ID number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!idExpiryDay || !idExpiryMonth || !idExpiryYear) {
      toast({
        title: "Missing information",
        description: "Please enter your ID expiry date.",
        variant: "destructive",
      });
      return;
    }
    
    if (!frontImage) {
      toast({
        title: "Missing document",
        description: "Please upload the front of your ID document.",
        variant: "destructive",
      });
      return;
    }
    
    if (idType !== "passport" && !backImage) {
      toast({
        title: "Missing document",
        description: "Please upload the back of your ID document.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selfieImage) {
      toast({
        title: "Missing document",
        description: "Please upload a selfie with your ID document.",
        variant: "destructive",
      });
      return;
    }
    
    // Construct expiry date
    const idExpiry = new Date(`${idExpiryYear}-${idExpiryMonth.padStart(2, '0')}-${idExpiryDay.padStart(2, '0')}`);
    
    // In a real implementation, we would use FormData to upload the files
    // For this example, we'll just submit the other data
    submitKycMutation.mutate({
      idType,
      idNumber,
      idExpiry: idExpiry.toISOString(),
      status: "pending",
    });
  };
  
  // Get KYC status display
  const getKycStatusDisplay = () => {
    if (isLoadingKyc) {
      return <Skeleton className="h-6 w-24" />;
    }
    
    const status = kycData?.status || user?.kycStatus || "not_started";
    
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
            <span className="text-green-500 font-medium">Approved</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-yellow-500 font-medium">Pending Review</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
            <span className="text-red-500 font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground mr-2"></span>
            <span className="text-muted-foreground font-medium">Not Started</span>
          </div>
        );
    }
  };
  
  // Helper component for skeleton loading
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-muted rounded ${className}`}></div>
  );

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Complete your identity verification process</p>
        </div>
        <div>
          <div className="inline-flex items-center border border-border bg-card px-4 py-2 rounded-md">
            <span className="text-sm font-medium mr-2">Status:</span>
            {getKycStatusDisplay()}
          </div>
        </div>
      </div>
      
      {/* KYC Status Alert */}
      {!isLoadingKyc && (
        <>
          {(user?.kycStatus === "approved" || kycData?.status === "approved") && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <AlertTitle className="text-green-500">Verification Approved</AlertTitle>
              <AlertDescription>
                Your identity has been successfully verified. You now have full access to all platform features.
              </AlertDescription>
            </Alert>
          )}
          
          {(user?.kycStatus === "pending" || kycData?.status === "pending") && (
            <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-yellow-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <AlertTitle className="text-yellow-500">Verification In Progress</AlertTitle>
              <AlertDescription>
                Your documents are being reviewed. This process typically takes 1-3 business days.
              </AlertDescription>
            </Alert>
          )}
          
          {(user?.kycStatus === "rejected" || kycData?.status === "rejected") && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <AlertTitle className="text-red-500">Verification Rejected</AlertTitle>
              <AlertDescription>
                Your verification was rejected. Please submit new documents ensuring they meet all requirements.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      
      {/* KYC Process Steps */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Submit Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide your government-issued ID and a selfie
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Verification Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your submitted information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Get Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Once approved, gain full access to the platform
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* KYC Form */}
      {(!user?.kycStatus || user.kycStatus === "not_started" || user.kycStatus === "rejected") && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Please provide your identification details for KYC verification
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleKycSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id-type">ID Document Type</Label>
                  <Select 
                    value={idType} 
                    onValueChange={setIdType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="id-number">ID Number</Label>
                  <Input
                    id="id-number"
                    placeholder="Enter your document number"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Expiry Date</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="DD"
                      maxLength={2}
                      value={idExpiryDay}
                      onChange={(e) => setIdExpiryDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    />
                    <Input
                      placeholder="MM"
                      maxLength={2}
                      value={idExpiryMonth}
                      onChange={(e) => setIdExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    />
                    <Input
                      placeholder="YYYY"
                      maxLength={4}
                      value={idExpiryYear}
                      onChange={(e) => setIdExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Document Upload</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="front-image" className="block mb-2">Front of ID Document</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="front-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setFrontImage)}
                        className="max-w-md"
                      />
                      {frontImage && (
                        <span className="text-sm text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-4 h-4 mr-1">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          File selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG or PNG, max 5MB. Ensure all details are clearly visible.
                    </p>
                  </div>
                  
                  {idType !== "passport" && (
                    <div>
                      <Label htmlFor="back-image" className="block mb-2">Back of ID Document</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="back-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setBackImage)}
                          className="max-w-md"
                        />
                        {backImage && (
                          <span className="text-sm text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-4 h-4 mr-1">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            File selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG or PNG, max 5MB. Ensure all details are clearly visible.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="selfie-image" className="block mb-2">Selfie with ID Document</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="selfie-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setSelfieImage)}
                        className="max-w-md"
                      />
                      {selfieImage && (
                        <span className="text-sm text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block w-4 h-4 mr-1">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          File selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG or PNG, max 5MB. Take a photo of yourself holding your ID.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Privacy Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Your information will be securely stored and used only for verification purposes in accordance with our privacy policy. 
                  All data is encrypted and handled with strict confidentiality.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={submitKycMutation.isPending}
              >
                {submitKycMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {/* KYC Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Verification Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To ensure your verification process goes smoothly, please follow these guidelines:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <h3 className="font-medium">Clear Documents</h3>
                </div>
                <p className="text-sm text-muted-foreground">Ensure all text and photos on your ID are clearly visible and not cut off.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <h3 className="font-medium">Good Lighting</h3>
                </div>
                <p className="text-sm text-muted-foreground">Take photos in a well-lit environment without glare or shadows.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  <h3 className="font-medium">Valid Documents</h3>
                </div>
                <p className="text-sm text-muted-foreground">Use only government-issued IDs that are not expired or damaged.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                  </svg>
                  <h3 className="font-medium">Clear Selfie</h3>
                </div>
                <p className="text-sm text-muted-foreground">Your face must be clearly visible in the selfie, matching your ID photo.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M3 15h6" />
                    <path d="m8 10-3 5 3 5" />
                  </svg>
                  <h3 className="font-medium">File Format</h3>
                </div>
                <p className="text-sm text-muted-foreground">Submit files in JPG or PNG format, under 5MB each.</p>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary mr-2">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                  <h3 className="font-medium">No Alterations</h3>
                </div>
                <p className="text-sm text-muted-foreground">Do not edit, crop, or alter the documents or selfie in any way.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
