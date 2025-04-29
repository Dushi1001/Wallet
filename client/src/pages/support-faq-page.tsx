import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InsertSupportTicket, Faq, SupportTicket } from "@shared/schema";
import { Loader2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SupportFaqPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"faq" | "support">("faq");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for support ticket form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Fetch FAQs
  const { data: faqs, isLoading: isLoadingFaqs } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
    enabled: true,
  });
  
  // Fetch user's support tickets
  const { data: tickets, isLoading: isLoadingTickets } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support/tickets"],
    enabled: !!user && activeTab === "support",
  });
  
  // Create support ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: Omit<InsertSupportTicket, "userId" | "status">) => {
      const response = await apiRequest("POST", "/api/support/tickets", ticketData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      
      toast({
        title: "Support ticket created",
        description: "Your support request has been submitted successfully.",
      });
      
      // Reset form
      setSubject("");
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to create support ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle support form submission
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please provide a subject for your support request.",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please provide details about your support request.",
        variant: "destructive",
      });
      return;
    }
    
    createTicketMutation.mutate({
      subject,
      message,
    });
  };
  
  // Filter FAQs based on search term
  const filteredFaqs = faqs?.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group FAQs by category
  const faqsByCategory = filteredFaqs?.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);
  
  // Sample FAQs (would come from API in real implementation)
  const sampleFaqs = [
    {
      id: 1,
      question: "How do I add a wallet to my account?",
      answer: "To add a wallet to your account, go to the Wallets page and click the 'Add New Wallet' button. You can either connect an existing wallet or create a new one.",
      category: "Wallets",
    },
    {
      id: 2,
      question: "What is KYC verification and why do I need it?",
      answer: "KYC (Know Your Customer) verification is a process that verifies your identity. It's required for regulatory compliance and helps prevent fraud and money laundering. Complete KYC to access all platform features.",
      category: "Account",
    },
    {
      id: 3,
      question: "How do I swap one cryptocurrency for another?",
      answer: "To swap cryptocurrencies, go to the Swap page, select the currencies you want to exchange, enter the amount, review the exchange rate and fees, then click 'Swap Currencies'.",
      category: "Transactions",
    },
    {
      id: 4,
      question: "What fees are charged for transactions?",
      answer: "Transaction fees vary depending on the cryptocurrency network and current network congestion. You'll see the exact fee before confirming any transaction.",
      category: "Transactions",
    },
    {
      id: 5,
      question: "How secure is the platform?",
      answer: "We employ industry-leading security measures including encryption, two-factor authentication, and regular security audits. Your funds and personal information are protected by state-of-the-art security protocols.",
      category: "Security",
    },
    {
      id: 6,
      question: "How do I reset my password?",
      answer: "To reset your password, go to the Settings page, select the Security tab, and click on 'Change Password'. You'll need to enter your current password and then your new password.",
      category: "Account",
    },
    {
      id: 7,
      question: "What cryptocurrencies are supported?",
      answer: "We currently support Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Cardano (ADA), Polkadot (DOT), and several other major cryptocurrencies. We regularly add support for new cryptocurrencies.",
      category: "General",
    },
    {
      id: 8,
      question: "How do I track my portfolio performance?",
      answer: "You can track your portfolio performance on the Portfolio page, which shows your total balance, asset allocation, and performance over time with interactive charts and analytics.",
      category: "Portfolio",
    },
  ];

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Support & FAQ</h1>
          <p className="text-muted-foreground mt-1">Get help and find answers to frequently asked questions</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "faq" | "support")} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="faq">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            FAQ
          </TabsTrigger>
          <TabsTrigger value="support">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Support
          </TabsTrigger>
        </TabsList>
        
        {/* FAQ Tab */}
        <TabsContent value="faq">
          {/* Search Box */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          {isLoadingFaqs ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted animate-pulse rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Show all FAQs if no search term */}
              {!searchTerm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a href="#wallets" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>How to add and manage wallets</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                      <a href="#kyc" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>Complete KYC verification</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                      <a href="#security" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>Account security best practices</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a href="#send-receive" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>How to send and receive crypto</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                      <a href="#swap" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>Swapping cryptocurrencies</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                      <a href="#fees" className="block p-2 hover:bg-muted rounded-md transition-colors">
                        <div className="flex items-center justify-between">
                          <span>Understanding transaction fees</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* FAQ Accordion */}
              <div className="space-y-6">
                {faqs || filteredFaqs 
                  ? Object.entries(faqsByCategory || {}).map(([category, categoryFaqs]) => (
                      <Card key={category} id={category.toLowerCase()}>
                        <CardHeader>
                          <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {categoryFaqs.map((faq) => (
                              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))
                  : sampleFaqs.length > 0 
                  ? (sampleFaqs.reduce((acc, faq) => {
                      if (!acc[faq.category]) {
                        acc[faq.category] = [];
                      }
                      acc[faq.category].push(faq);
                      return acc;
                    }, {} as Record<string, typeof sampleFaqs>) || {})
                  && Object.entries(sampleFaqs.reduce((acc, faq) => {
                      if (!acc[faq.category]) {
                        acc[faq.category] = [];
                      }
                      if (searchTerm) {
                        if (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) {
                          acc[faq.category].push(faq);
                        }
                      } else {
                        acc[faq.category].push(faq);
                      }
                      return acc;
                    }, {} as Record<string, typeof sampleFaqs>))
                    .filter(([_, categoryFaqs]) => categoryFaqs.length > 0)
                    .map(([category, categoryFaqs]) => (
                      <Card key={category} id={category.toLowerCase()}>
                        <CardHeader>
                          <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {categoryFaqs.map((faq) => (
                              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))
                  : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-muted-foreground">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2">No FAQs Found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? "No FAQ entries match your search criteria." 
                          : "FAQ content is currently unavailable."}
                      </p>
                    </div>
                  )}
              </div>
              
              {/* Contact Support Card */}
              <Card className="mt-10">
                <CardHeader>
                  <CardTitle>Can't find what you're looking for?</CardTitle>
                  <CardDescription>Our support team is here to help with any questions you may have.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab("support")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Support Tab */}
        <TabsContent value="support">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Support Ticket Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Support Ticket</CardTitle>
                  <CardDescription>Submit a new support request</CardDescription>
                </CardHeader>
                <form onSubmit={handleSupportSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your issue or question"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Ticket"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            
            {/* Support Info and Previous Tickets */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@auttobi.com</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">We aim to respond to all tickets within 24 hours.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Operating Hours</h3>
                    <p className="text-sm text-muted-foreground">24/7 support available for urgent issues.</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Previous Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Tickets</CardTitle>
                  <CardDescription>Previously submitted support requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTickets ? (
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted animate-pulse rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : tickets && tickets.length > 0 ? (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              ticket.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                              ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                              ticket.status === 'closed' ? 'bg-green-500/10 text-green-500' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">You haven't submitted any support tickets yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
