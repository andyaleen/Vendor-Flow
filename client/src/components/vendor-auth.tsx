import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const vendorAuthSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
});

type VendorAuthFormData = z.infer<typeof vendorAuthSchema>;

interface VendorAuthProps {
  token: string;
  onAuthenticated: (vendorData: any) => void;
  request?: {
    requesterCompany: string;
  };
}

export function VendorAuth({ token, onAuthenticated, request }: VendorAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  
  // Debug the request data
  console.log('VendorAuth received request:', request);
  console.log('Request company name:', request?.requesterCompany);

  const form = useForm<VendorAuthFormData>({
    resolver: zodResolver(vendorAuthSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      companyName: "",
    },
  });

  const authMutation = useMutation({
    mutationFn: async (data: VendorAuthFormData) => {
      console.log('Starting authentication mutation...');
      console.log('Data received:', data);
      
      try {
        if (isSignUp) {
          console.log('Attempting signup with backend API...');
          // Use the existing backend signup that was working
          const result = await apiRequest("POST", `/api/vendor/signup`, {
            ...data,
            onboardingToken: token,
          });
          console.log('Vendor creation result:', result);
          return result;
        } else {
          console.log('Attempting login with backend API...');
          // Use the same backend system for consistency
          const result = await apiRequest("POST", `/api/vendor/login`, {
            email: data.email,
            password: data.password,
            onboardingToken: token,
          });
          console.log('Vendor login result:', result);
          return result;
        }
      } catch (err) {
        console.error('Authentication mutation error:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      toast({
        title: isSignUp ? "Account created!" : "Welcome back!",
        description: "You can now complete your onboarding.",
      });
      onAuthenticated(data);
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: VendorAuthFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Is sign up?', isSignUp);
    authMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">VendorFlow</span>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create Your Account" : 
             request?.requesterCompany ? `${request.requesterCompany} invites you to onboard as a vendor` : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create an account to complete your vendor onboarding"
              : "Sign in to continue with your onboarding"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
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
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={authMutation.isPending}
              >
                {authMutation.isPending 
                  ? (isSignUp ? "Creating Account..." : "Signing In...") 
                  : (isSignUp ? "Create Account" : "Sign In")
                }
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp ? "Sign in here" : "Create one here"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}