import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Building, FileText, Shield, CreditCard, FileCheck, CheckCircle } from "lucide-react";

const userOnboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

const businessInfoSchema = z.object({
  legalBusinessName: z.string().min(1, "Legal business name is required"),
  dbaName: z.string().optional(),
  taxId: z.string().min(1, "Taxpayer ID is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  companyEmail: z.string().email("Please enter a valid company email"),
});

type UserOnboardingFormData = z.infer<typeof userOnboardingSchema>;
type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

const uploadOptions = [
  { 
    id: "basic", 
    label: "Basic Information", 
    required: true, 
    icon: Building,
    description: "Company details and contact information"
  },
  { 
    id: "w9", 
    label: "W9", 
    required: false, 
    icon: FileText,
    description: "Tax form for vendor payments"
  },
  { 
    id: "insurance", 
    label: "Certificate of Insurance", 
    required: false, 
    icon: Shield,
    description: "Proof of liability coverage"
  },
  { 
    id: "payment", 
    label: "Payment Details", 
    required: false, 
    icon: CreditCard,
    description: "Banking and payment information"
  },
  { 
    id: "nda", 
    label: "NDA", 
    required: false, 
    icon: FileCheck,
    description: "Non-disclosure agreement"
  },
];

export default function UserOnboarding() {
  const [step, setStep] = useState(1);
  const [selectedUploads, setSelectedUploads] = useState<string[]>(["basic"]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<UserOnboardingFormData>({
    resolver: zodResolver(userOnboardingSchema),
    defaultValues: {
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const businessForm = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      legalBusinessName: "",
      dbaName: "",
      taxId: "",
      businessAddress: "",
      phoneNumber: "",
      companyEmail: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserOnboardingFormData & BusinessInfoFormData) => {
      return apiRequest("POST", "/api/user/setup", {
        ...data,
        selectedUploads,
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to VendorFlow!",
        description: "Please sign in to access your dashboard.",
      });
      // Redirect to login so user can authenticate and access dashboard
      window.location.href = "/api/login";
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUserInfoSubmit = (data: UserOnboardingFormData) => {
    form.clearErrors();
    // Complete signup with just basic info and redirect to dashboard
    createUserMutation.mutate({
      ...data,
      // Provide default values for business info fields
      legalBusinessName: "",
      dbaName: "",
      taxId: "",
      businessAddress: "",
      phoneNumber: "",
      companyEmail: "",
    });
  };

  const handleUploadSelectionNext = () => {
    // Since Basic Information is always required and selected, always go to step 3
    console.log('Current step:', step, 'Moving to step 3');
    setStep(3);
  };

  const handleBusinessInfoSubmit = (data: BusinessInfoFormData) => {
    businessForm.clearErrors();
    const userData = form.getValues();
    createUserMutation.mutate({ ...userData, ...data });
  };

  const handleUploadToggle = (uploadId: string) => {
    if (uploadId === "basic") return; // Basic is always required
    
    setSelectedUploads(prev => 
      prev.includes(uploadId) 
        ? prev.filter(id => id !== uploadId)
        : [...prev, uploadId]
    );
  };

  const handleComplete = () => {
    const formData = form.getValues();
    createUserMutation.mutate(formData);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <CardTitle className="text-2xl">Welcome to VendorFlow</CardTitle>
            <CardDescription>
              Let's get started by setting up your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUserInfoSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Next, let's decide what you want to upload</CardTitle>
          <CardDescription>
            Select the information and documents you'd like vendors to provide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {uploadOptions.map((option) => {
              const isSelected = selectedUploads.includes(option.id);
              const Icon = option.icon;
              
              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => handleUploadToggle(option.id)}
                    disabled={option.required}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } ${option.required ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected ? "text-green-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{option.label}</h3>
                          {option.required && (
                            <span className="text-xs text-blue-600 font-medium">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleUploadSelectionNext}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    );
  }

  // Step 3: Business Information Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Basic Information</CardTitle>
          <CardDescription>
            Please provide your business details to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...businessForm}>
            <form onSubmit={businessForm.handleSubmit(handleBusinessInfoSubmit)} className="space-y-6">
              <FormField
                control={businessForm.control}
                name="legalBusinessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Business Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your legal business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={businessForm.control}
                name="dbaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DBA (Doing Business As) Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter DBA name (if applicable)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={businessForm.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxpayer Identification Number *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XX-XXXXXXX" 
                        {...field}
                        onChange={(e) => {
                          // Format as XX-XXXXXXX
                          let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '-' + value.slice(2, 9);
                          }
                          field.onChange(value);
                        }}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={businessForm.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your complete business address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={businessForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(XXX) XXX-XXXX" 
                          {...field}
                          onChange={(e) => {
                            // Format as (XXX) XXX-XXXX
                            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                            if (value.length >= 6) {
                              value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                            } else if (value.length >= 3) {
                              value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                            } else if (value.length > 0) {
                              value = `(${value}`;
                            }
                            field.onChange(value);
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={businessForm.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1"
                >
                  {createUserMutation.isPending ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}