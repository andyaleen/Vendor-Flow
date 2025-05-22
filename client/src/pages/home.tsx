import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { createRequestSchema, type CreateRequestFormData } from "@shared/schema";
import { Plus, Copy, Users, Settings, Filter, MoreHorizontal, Link as LinkIcon, FileText, Building, Mail, Phone, CreditCard, Shield, ChevronDown, LogOut, Home as HomeIcon } from "lucide-react";

const availableFields = [
  { id: "company_info", label: "Company Information", required: true, icon: Building },
  { id: "contact_info", label: "Primary Contact Information", required: true, icon: Mail },
];

// Mock data for demonstration
const vendorRequests = [
  {
    id: 2,
    title: "Basic Vendor Setup",
    description: "Essential information for new vendors (recommended)",
    fields: ["company_info", "contact_info"],
    createdAt: new Date("2024-01-10"),
    link: "https://vendorflow.com/onboarding/def456"
  }
];

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const selectedRequest = vendorRequests.find(req => req.id === selectedRequestId);

  const form = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      requesterCompany: "",
      requesterEmail: "",
      requestedFields: availableFields.filter(f => f.required).map(f => f.id),
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: CreateRequestFormData) => {
      const response = await apiRequest("/api/onboarding-requests", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Request created successfully!",
        description: "Your vendor onboarding request has been created.",
      });
    },
    onError: (error) => {
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

  const getFieldIcon = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    return field?.icon || FileText;
  };

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    return field?.label || fieldId;
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
              <h1 className="text-xl font-semibold text-gray-900">VendorFlow</h1>
            </div>
          </div>
          
          <nav className="px-6">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setLocation('/')}
              >
                <HomeIcon className="w-4 h-4 mr-3" />
                Home
              </Button>
              <Button variant="secondary" className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Users className="w-4 h-4 mr-3" />
                Vendors
              </Button>
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/api/logout')}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Left Panel - Vendor Requests */}
          <div className="w-80 p-6 border-r border-gray-200">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Event Types</h1>
              <p className="text-gray-600 text-sm mt-1">Set up your vendor onboarding flows</p>
            </div>

            <div className="space-y-3">
              {/* Basic Vendor Setup Card */}
              {vendorRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`cursor-pointer transition-all ${
                    selectedRequestId === request.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRequestId(request.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-8 bg-blue-500 rounded-sm flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{request.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {request.fields.length} fields • One-on-One
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Request Button */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Event Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Vendor Request</DialogTitle>
                    <DialogDescription>
                      Set up a new onboarding flow for your vendors
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="requesterCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Corporation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="requesterEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@acme.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel>Required Information</FormLabel>
                        <div className="space-y-2 mt-2">
                          {availableFields.map((field) => (
                            <FormField
                              key={field.id}
                              control={form.control}
                              name="requestedFields"
                              render={({ field: formField }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={formField.value?.includes(field.id)}
                                      onCheckedChange={(checked) => {
                                        const value = formField.value || [];
                                        if (checked) {
                                          formField.onChange([...value, field.id]);
                                        } else {
                                          formField.onChange(value.filter((id) => id !== field.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {field.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
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

          {/* Right Panel - Details */}
          <div className="flex-1 p-6">
            {selectedRequest ? (
              <div className="max-w-md">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedRequest.title}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRequestId(null)}>
                      ✕
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">One-on-One</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Asks for:</h3>
                    <div className="space-y-2">
                      {selectedRequest.fields.map((fieldId) => {
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

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        More options
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Save changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">Select an event type</p>
                  <p className="text-sm">Choose a vendor onboarding flow to view or edit details</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}