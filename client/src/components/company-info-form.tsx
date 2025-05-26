import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyInfoSchema, type CompanyInfoFormData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleAddressAutocomplete } from "@/components/google-address-autocomplete";
import { useState } from "react";

interface CompanyInfoFormProps {
  onSubmit: (data: CompanyInfoFormData) => void;
  initialData?: Partial<CompanyInfoFormData>;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function CompanyInfoForm({ 
  onSubmit, 
  initialData, 
  onNext, 
  onPrevious, 
  isLoading 
}: CompanyInfoFormProps) {
  const [sameAsPrimary, setSameAsPrimary] = useState(true);

  const form = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      dbaName: initialData?.dbaName || "",
      taxId: initialData?.taxId || "",
      businessType: initialData?.businessType || "",
      street: initialData?.street || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "US",
      primaryContactName: initialData?.primaryContactName || "",
      primaryContactTitle: initialData?.primaryContactTitle || "",
      primaryContactEmail: initialData?.primaryContactEmail || "",
      primaryContactPhone: initialData?.primaryContactPhone || "",
      arContactName: initialData?.arContactName || "",
      arContactEmail: initialData?.arContactEmail || "",
      sameAsPrimary: true,
    },
  });

  const handleSubmit = (data: CompanyInfoFormData) => {
    onSubmit(data);
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Provide your company details and primary contact information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Company Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Legal Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your company's legal name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dbaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DBA / Trade Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doing business as (if different)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Federal Tax ID (EIN) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XX-XXXXXXX" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            {/* Business Address */}
            <div>
              <h3 className="text-base font-medium text-neutral-800 mb-4">Business Address</h3>
              <GoogleAddressAutocomplete
                onAddressSelect={(address) => {
                  form.setValue('street', address.street);
                  form.setValue('city', address.city);
                  form.setValue('state', address.state);
                  form.setValue('postalCode', address.postalCode);
                  form.setValue('country', address.country);
                }}
                initialValues={{
                  street: form.getValues('street'),
                  city: form.getValues('city'),
                  state: form.getValues('state'),
                  postalCode: form.getValues('postalCode'),
                  country: form.getValues('country'),
                }}
              />
            </div>
            
            <Separator />
            
            {/* Primary Contact */}
            <div>
              <h3 className="text-base font-medium text-neutral-800 mb-4">Primary Contact Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="primaryContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Contact Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter contact name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContactTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title/Position <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter job title" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="Enter phone number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Accounts Receivable Contact */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-neutral-800">Accounts Receivable Contact</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="same-as-primary"
                    checked={sameAsPrimary}
                    onCheckedChange={(checked) => setSameAsPrimary(!!checked)}
                  />
                  <Label htmlFor="same-as-primary" className="text-sm text-neutral-600">
                    Same as primary contact
                  </Label>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${sameAsPrimary ? 'opacity-50' : ''}`}>
                <FormField
                  control={form.control}
                  name="arContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AR Contact Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter AR contact name" 
                          disabled={sameAsPrimary}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="arContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AR Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter AR email address"
                          disabled={sameAsPrimary}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-4 sm:space-y-0">
              <Button 
                type="button" 
                variant="outline"
                onClick={onPrevious}
              >
                Previous
              </Button>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
