import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createRequestSchema, type CreateRequestFormData } from "@shared/schema";
import { Link, Users, FileText, Shield, ArrowRight } from "lucide-react";

const availableFields = [
  { id: "company_info", label: "Company Legal Information", required: true },
  { id: "banking", label: "Banking & Payment Details", required: true },
  { id: "tax_docs", label: "Tax Documentation (W-9)", required: true },
  { id: "insurance", label: "Insurance Certificates", required: false },
  { id: "contact_info", label: "Primary Contact Information", required: true },
];

export default function Home() {
  const [generatedLink, setGeneratedLink] = useState<string>("");
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
      setGeneratedLink(data.link);
      toast({
        title: "Onboarding request created",
        description: "Your vendor onboarding link has been generated successfully.",
      });
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Link copied",
      description: "The onboarding link has been copied to your clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-neutral-800">VendorFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Vendors
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Streamline Your Vendor Onboarding
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Generate secure onboarding links and collect vendor information effortlessly
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Link className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Generate Secure Links</h3>
              <p className="text-neutral-600">Create unique, time-limited onboarding links for each vendor</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Collect Documents</h3>
              <p className="text-neutral-600">Gather W-9s, insurance certificates, and other required documents</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Secure Process</h3>
              <p className="text-neutral-600">Bank-level security with encrypted data transmission</p>
            </div>
          </div>
        </div>

        {!generatedLink ? (
          /* Create Request Form */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Create Vendor Onboarding Request</CardTitle>
              <CardDescription>
                Generate a secure link to send to your vendor for onboarding
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="requesterCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Company Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your company name" 
                            {...field} 
                          />
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
                          <Input 
                            type="email"
                            placeholder="Enter your email address" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel className="text-base font-medium">Required Information</FormLabel>
                    <p className="text-sm text-neutral-600 mb-4">
                      Select what information you need from the vendor
                    </p>
                    
                    <div className="space-y-3">
                      {availableFields.map((field) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name="requestedFields"
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                                <FormLabel className="cursor-pointer">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={createRequestMutation.isPending}
                  >
                    {createRequestMutation.isPending ? (
                      "Generating Link..."
                    ) : (
                      <>
                        Generate Onboarding Link
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          /* Generated Link Display */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-green-600">Onboarding Link Generated!</CardTitle>
              <CardDescription>
                Send this secure link to your vendor to begin the onboarding process
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vendor Onboarding Link
                </label>
                <div className="flex space-x-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyToClipboard} variant="outline">
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Send this link to your vendor via email</li>
                  <li>• The link will expire in 30 days</li>
                  <li>• You'll be notified when the vendor completes onboarding</li>
                  <li>• All data is encrypted and secure</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => {
                  setGeneratedLink("");
                  form.reset();
                }}
                variant="outline"
                className="w-full"
              >
                Create Another Request
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
