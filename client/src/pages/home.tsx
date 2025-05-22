import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createRequestSchema, type CreateRequestFormData } from "@shared/schema";
import { Plus, Copy, Users, Settings, Filter, MoreHorizontal, Link as LinkIcon, FileText, Building, Mail, Phone, CreditCard, Shield } from "lucide-react";

const availableFields = [
  { id: "company_info", label: "Company Legal Information", required: true, icon: Building },
  { id: "banking", label: "Banking & Payment Details", required: true, icon: CreditCard },
  { id: "tax_docs", label: "Tax Documentation (W-9)", required: true, icon: FileText },
  { id: "insurance", label: "Insurance Certificates", required: false, icon: Shield },
  { id: "contact_info", label: "Primary Contact Information", required: true, icon: Mail },
];

// Mock data for demonstration
const vendorRequests = [
  {
    id: 1,
    title: "Standard Vendor Onboarding",
    description: "Complete vendor setup with all required documents",
    fields: ["company_info", "banking", "tax_docs", "contact_info"],
    createdAt: new Date("2024-01-15"),
    link: "https://vendorflow.com/onboarding/abc123"
  },
  {
    id: 2,
    title: "Basic Vendor Setup",
    description: "Essential information for new vendors",
    fields: ["company_info", "contact_info"],
    createdAt: new Date("2024-01-10"),
    link: "https://vendorflow.com/onboarding/def456"
  }
];

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

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
      const response = await apiRequest("POST", "/api/onboarding-requests", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Vendor request created",
        description: "Your vendor onboarding link has been generated successfully.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating request",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateRequestFormData) => {
    createRequestMutation.mutate(data);
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">VendorFlow</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Vendors
              </Button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6 space-y-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Vendor Request</DialogTitle>
                  <DialogDescription>
                    Set up a new vendor onboarding request with the information you need to collect.
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
                            <Input placeholder="Enter your company name" {...field} />
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
                          <FormLabel>Your Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel className="text-sm font-medium">Required Information</FormLabel>
                      <p className="text-sm text-gray-600 mb-3">
                        Select what information you need from the vendor
                      </p>
                      
                      <div className="space-y-2">
                        {availableFields.map((field) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name="requestedFields"
                            render={({ field: formField }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={formField.value?.includes(field.id)}
                                    disabled={field.required}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        formField.onChange([...formField.value, field.id]);
                                      } else {
                                        formField.onChange(
                                          formField.value?.filter((value) => value !== field.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm cursor-pointer">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={createRequestMutation.isPending}
                      >
                        {createRequestMutation.isPending ? "Creating..." : "Create Request"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50">
                <FileText className="w-4 h-4 mr-3" />
                Vendor Requests
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600">
                <Users className="w-4 h-4 mr-3" />
                Vendors
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600">
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Vendor Requests</h1>
                <p className="text-gray-600 mt-1">Manage your vendor onboarding requests</p>
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
                      New Vendor Request
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Vendor Request Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorRequests.map((request) => (
                <Card key={request.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medium text-gray-900 mb-1">
                          {request.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {request.description}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Required Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Information</h4>
                        <div className="space-y-2">
                          {request.fields.map((fieldId) => {
                            const IconComponent = getFieldIcon(fieldId);
                            return (
                              <div key={fieldId} className="flex items-center text-sm text-gray-600">
                                <div className="w-4 h-4 bg-blue-100 rounded-sm flex items-center justify-center mr-2">
                                  <IconComponent className="w-3 h-3 text-blue-600" />
                                </div>
                                {getFieldLabel(fieldId)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => copyToClipboard(request.link)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy link
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Card */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create new vendor request</h3>
                      <p className="text-sm text-gray-600 text-center">
                        Set up a new onboarding process for your vendors
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
