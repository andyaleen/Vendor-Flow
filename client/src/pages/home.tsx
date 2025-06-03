import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import logoImage from "@assets/ChatGPT Image Jun 3, 2025, 03_49_26 PM.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { createRequestSchema, type CreateRequestFormData } from "@shared/schema";
import { Plus, Copy, Users, Settings, Filter, MoreHorizontal, Building, Mail, ChevronDown, LogOut, Home as HomeIcon, User, UserCheck, FileText, Shield, CreditCard, Award, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const availableFields = [
  { 
    id: "company_info", 
    label: "Company Information", 
    required: true, 
    icon: Building,
    tooltip: "Basic company details including name, address, and business type"
  },
  { 
    id: "contact_info", 
    label: "Primary Contact Information", 
    required: true, 
    icon: Mail,
    tooltip: "Main contact person details for business correspondence"
  },
  { 
    id: "w9_tax", 
    label: "W9 / Tax Documentation", 
    required: false, 
    icon: FileText,
    tooltip: "IRS form for U.S. tax identification and reporting"
  },
  { 
    id: "insurance", 
    label: "Certificate of Insurance", 
    required: false, 
    icon: Shield,
    tooltip: "Proof of insurance coverage and liability protection"
  },
  { 
    id: "banking", 
    label: "Banking / ACH Info", 
    required: false, 
    icon: CreditCard,
    tooltip: "Bank details for direct deposit and payment processing"
  },
  { 
    id: "license", 
    label: "Business License", 
    required: false, 
    icon: Award,
    tooltip: "Official permits and licenses to operate your business"
  },
];

// We'll fetch real data from the API instead of using mock data

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { profile, isComplete } = useProfile();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Block unauthenticated access
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Fetch onboarding requests from API
  const { data: vendorRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['/api/onboarding-requests'],
    enabled: !!user,
  });

  const selectedRequest = vendorRequests.find((req: any) => req.id === selectedRequestId);

  const form = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      onboardingTypeName: "",
      requestedFields: availableFields.filter(f => f.required).map(f => f.id),
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: CreateRequestFormData) => {
      const response = await fetch("/api/onboarding-requests", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      form.reset();
      // Refresh the dashboard to show the new request
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding-requests'] });
      toast({
        title: "Request created successfully!",
        description: "Your vendor onboarding request has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create vendor request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateRequestFormData) => {
    createRequestMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copied!",
      description: "The vendor onboarding link has been copied to your clipboard.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to VendorFlow</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/api/login')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <img src={logoImage} alt="Logo" className="h-8 w-auto" />
            </div>
          </div>
          
          <nav className="px-6">
            <div className="space-y-2">
              <Button 
                variant={location === '/dashboard' || location === '/' ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  location === '/dashboard' || location === '/' 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setLocation('/dashboard')}
              >
                <HomeIcon className="w-4 h-4 mr-3" />
                Home
              </Button>
              <Button 
                variant={location.startsWith('/vendors') ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  location.startsWith('/vendors')
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setLocation('/vendors')}
              >
                <Users className="w-4 h-4 mr-3" />
                Vendors
              </Button>
              {!isComplete && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-orange-200"
                  onClick={() => setLocation('/profile-setup')}
                >
                  <UserCheck className="w-4 h-4 mr-3" />
                  Complete your profile
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start text-gray-600">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </div>
          </nav>
          
          {/* User Menu */}
          <div className="absolute bottom-6 left-6 right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || 'User'
                        }
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/switch-account')}>
                  <Users className="w-4 h-4 mr-2" />
                  Switch Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  try {
                    // Sign out from Supabase and await completion
                    await supabase.auth.signOut();
                    
                    // Clear local storage
                    localStorage.removeItem("supabase.auth.token");
                    sessionStorage.clear();
                    
                    // Use proper logout endpoint that clears Google OAuth session
                    await fetch("/api/auth/logout", {
                      method: "GET",
                      credentials: "include",
                    });
                    
                    // Force refresh to ensure clean state
                    window.location.href = "/logged-out";
                  } catch (error) {
                    console.error("Logout error:", error);
                    window.location.href = "/logged-out";
                  }
                }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Main Panel - Event Types Grid */}
          <div className={`${selectedRequestId ? 'flex-1' : 'w-full'} p-8 transition-all duration-300`}>
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Onboarding Types</h1>
                  <p className="text-gray-600 mt-1">Set up your vendor onboarding flows</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Onboarding Type
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>

              {/* Event Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Vendor Setup Card */}
                {vendorRequests.map((request) => (
                  <Card 
                      key={request.id} 
                      className="cursor-pointer transition-all hover:shadow-md border border-gray-200 relative overflow-hidden"
                      onClick={() => setSelectedRequestId(request.id)}
                    >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-medium text-gray-900 mb-1">
                            {request.onboardingTypeName}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground space-y-1">
                            {(request.fields || []).map((field: string) => (
                              <div key={field} className="capitalize">
                                • {field.replaceAll("_", " ")}
                              </div>
                            ))}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <p className="text-sm text-blue-600 cursor-pointer hover:underline">
                          View Details
                        </p>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(request.link);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy link
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Create New Event Type Card */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Create new onboarding type</h3>
                        <p className="text-sm text-gray-600 text-center">
                          Set up a new onboarding process for your vendors
                        </p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Right Panel - Details (slides in when item selected) */}
          {selectedRequestId && (
            <div className="w-80 bg-white border-l border-gray-200 p-6 shadow-lg">
              <div className="max-w-md">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">EVENT TYPE</span>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedRequest?.title}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRequestId(null)}>
                      ✕
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">One-on-One</p>
                </div>

                <div className="space-y-6">
                  {/* Asks for */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Asks for:</h3>
                    <div className="space-y-2">
                      {selectedRequest?.fields.map((fieldId) => {
                        const field = availableFields.find(f => f.id === fieldId);
                        if (!field) return null;
                        const Icon = field.icon;
                        return (
                          <div key={fieldId} className="flex items-center space-x-3 text-sm">
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                              <Icon className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="text-gray-700">{field.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-6">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // Navigate to edit page for this onboarding type using the actual ID
                        setLocation(`/edit-event-type/${selectedRequestId}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Create New Event Type Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Onboarding Type</DialogTitle>
              <DialogDescription>
                Set up a new onboarding flow for your vendors
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="onboardingTypeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name This Onboarding Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Basic Vendor, Advanced Vendor, Enterprise Partner, 1099 Contractor" {...field} />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        This will help you organize different onboarding flows. Vendors won't see this name.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div>
                  <FormLabel>Required Information</FormLabel>
                  <TooltipProvider>
                    <div className="space-y-3 mt-3">
                      {availableFields.map((field) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name="requestedFields"
                          render={({ field: formField }) => (
                            <FormItem className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={formField.value?.includes(field.id)}
                                  disabled={field.required}
                                  onCheckedChange={(checked) => {
                                    const value = formField.value || [];
                                    if (checked) {
                                      formField.onChange([...value, field.id]);
                                    } else {
                                      formField.onChange(value.filter((id) => id !== field.id));
                                    }
                                  }}
                                  className="h-5 w-5"
                                />
                              </FormControl>
                              <div className="flex items-center space-x-2 flex-1">
                                <field.icon className="h-4 w-4 text-gray-500" />
                                <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      Required
                                    </span>
                                  )}
                                </FormLabel>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{field.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={createRequestMutation.isPending}>
                    {createRequestMutation.isPending ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}