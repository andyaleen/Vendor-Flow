import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OnboardingAccordion } from "@/components/onboarding-accordion";
import { VendorAuth } from "@/components/vendor-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getInitials, generateRequestId } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import type { CompanyInfoFormData, OnboardingRequest, Vendor, Document } from "@shared/schema";

export default function Onboarding() {
  const { token } = useParams<{ token: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vendorData, setVendorData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch onboarding request data with token validation
  const { data: requestData, isLoading, error } = useQuery({
    queryKey: [`/api/onboarding-requests/${token}`],
    enabled: !!token,
    retry: false, // Don't retry on expired tokens
  });

  // Fetch documents
  const { data: documentsData } = useQuery({
    queryKey: [`/api/onboarding-requests/${token}/documents`],
    enabled: !!token,
  });

  // Fetch user's existing documents for smart sharing
  const { data: userDocumentsData } = useQuery({
    queryKey: ['/api/user/documents'],
    enabled: isAuthenticated,
  });

  const request: OnboardingRequest | null = requestData?.request || null;
  const vendor: Vendor | null = requestData?.vendor || null;
  const documents: Document[] = documentsData?.documents || [];
  const userDocuments = userDocumentsData?.documents;

  // Handle vendor authentication
  const handleVendorAuthenticated = (data: any) => {
    setIsAuthenticated(true);
    setVendorData(data);
  };

  // Document consent mutation
  const consentMutation = useMutation({
    mutationFn: async (documentType: string) => {
      return apiRequest('/api/document-consent', {
        method: 'POST',
        body: {
          user_id: vendorData?.id || 1, // Use authenticated user ID
          onboarding_request_id: request?.id,
          document_type: documentType,
          consented_at: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Document shared successfully",
        description: "Your document has been shared with the requesting company."
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding-requests/${token}/documents`] });
    },
    onError: (error) => {
      toast({
        title: "Error sharing document",
        description: "Failed to share document. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update current step based on request data
  useEffect(() => {
    if (request) {
      // If vendor hasn't filled out info yet, start at step 1 to show welcome
      if (!vendor) {
        setCurrentStep(1);
      } else {
        setCurrentStep(request.currentStep || 1);
      }
    }
  }, [request, vendor]);

  // Company info submission
  const companyInfoMutation = useMutation({
    mutationFn: async (data: CompanyInfoFormData) => {
      const response = await apiRequest("POST", `/api/onboarding-requests/${token}/company-info`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Company information saved",
        description: "Your company details have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding-requests/${token}`] });
      updateStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Error saving company information",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Document upload
  const documentUploadMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch(`/api/onboarding-requests/${token}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding-requests/${token}/documents`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading document",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Document deletion
  const documentDeleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest("DELETE", `/api/documents/${documentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding-requests/${token}/documents`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting document",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Complete onboarding
  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/onboarding-requests/${token}/complete`);
      return response.json();
    },
    onSuccess: () => {
      // Refresh the request data to get updated status
      queryClient.invalidateQueries({ queryKey: [`/api/onboarding-requests/${token}`] });
      setCurrentStep(4);
    },
    onError: (error: any) => {
      toast({
        title: "Error completing onboarding",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Step update
  const updateStep = async (step: number) => {
    try {
      await apiRequest("PATCH", `/api/onboarding-requests/${token}/step`, { step });
      setCurrentStep(step);
    } catch (error) {
      console.error("Error updating step:", error);
    }
  };

  const handleCompanyInfoSubmit = (data: CompanyInfoFormData) => {
    companyInfoMutation.mutate(data);
  };

  const handleDocumentUpload = (file: File, documentType: string) => {
    documentUploadMutation.mutate({ file, documentType });
  };

  const handleDocumentDelete = (documentId: number) => {
    documentDeleteMutation.mutate(documentId);
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading onboarding request...</p>
        </div>
      </div>
    );
  }

  // Show expired token screen
  if (error && error.message?.includes('expired')) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Expired</h2>
            <p className="text-gray-600 mb-4">
              This onboarding link has expired. Please contact the requesting company for a new invitation.
            </p>
            <Button onClick={() => window.close()} variant="outline">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error screen for other errors
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h2>
            <p className="text-gray-600 mb-4">
              This onboarding request could not be found or is no longer valid.
            </p>
            <Button onClick={() => window.close()} variant="outline">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authentication form if vendor is not authenticated
  if (!isAuthenticated && request) {
    return <VendorAuth token={token!} onAuthenticated={handleVendorAuthenticated} request={request} />;
  }

  // Show completion screen when onboarding is finished
  if (request?.status === 'completed') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-neutral-900">Onbo</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                V
              </div>
              <span className="text-sm font-medium text-neutral-700">Vendor</span>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              You're All Set! 🎉
            </h1>
            
            <p className="text-lg text-neutral-600 mb-8">
              Thank you for completing your vendor onboarding. <strong>{request.requesterCompany}</strong> has been notified that your onboarding is finished.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700">
                Go to My Dashboard
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.close()}>
                Close Window
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }



  if (error || !request) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Request Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              The onboarding request could not be found or may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if request is expired
  if (new Date() > new Date(request.expiresAt)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-900">Request Expired</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              This onboarding request has expired. Please contact the requesting company for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already completed
  if (request.status === "completed") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-gray-900">Onboarding Complete</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Your vendor onboarding has been completed successfully. Thank you!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map requested fields to display information
  const fieldMapping: Record<string, { name: string; type: string; completed: boolean }> = {
    "company_info": { name: "Company Information", type: "form", completed: !!vendor },
    "contact_info": { name: "Primary Contact Information", type: "form", completed: !!vendor },
    "banking_info": { name: "Banking & Payment Details", type: "form", completed: !!vendor },
    "tax_documents": { name: "Tax Documentation (W-9)", type: "document", completed: documents.some(d => d.documentType === "w9") },
    "insurance_documents": { name: "Insurance Certificates", type: "document", completed: documents.some(d => d.documentType === "insurance") },
  };

  const requiredFieldsStatus = request.requestedFields.map(fieldId => {
    const field = fieldMapping[fieldId];
    return field ? field : { name: fieldId, type: "unknown", completed: false };
  });

  const vendorInitials = vendor?.primaryContactName ? getInitials(vendor.primaryContactName) : "V";
  const vendorName = vendor?.primaryContactName || "Vendor";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-neutral-800">Onbo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{vendorInitials}</span>
                </div>
                <span className="text-sm text-neutral-700 hidden sm:block">{vendorName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Welcome Section */}
      <div className="bg-white border-b border-neutral-200 py-12">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Welcome to Vendor Onboarding
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Let's get started by collecting your company information and required documents.
          </p>
          {!vendor && currentStep === 1 && (
            <Button 
              size="lg" 
              onClick={() => setCurrentStep(2)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding Request Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">Vendor Onboarding Request</h2>
                <p className="mt-1 text-sm text-neutral-600">Complete the following information to establish your vendor profile</p>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="text-blue-500 mt-0.5 w-5 h-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-neutral-800">
                    Request from: <span>{request.requesterCompany}</span>
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    You've been invited to complete vendor onboarding. This information will be used to establish payment and communication channels.
                  </p>
                  <div className="mt-2 text-xs text-neutral-500">
                    Request ID: <span>{generateRequestId()}</span> • 
                    Expires: <span>{new Date(request.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Required Information List */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-800 mb-3">Required Information:</h3>
              
              {requiredFieldsStatus.map((field, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <CheckCircle className={`mr-3 w-4 h-4 ${field.completed ? 'text-green-500' : 'text-neutral-300'}`} />
                    <span className="text-sm text-neutral-700">{field.name}</span>
                  </div>
                  {field.completed ? (
                    <span className="text-xs font-medium text-green-600">Complete</span>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        if (field.type === 'form') {
                          setCurrentStep(2); // Go to company info form
                        } else {
                          setCurrentStep(3); // Go to document upload
                        }
                      }}
                    >
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Welcome to Vendor Onboarding</h2>
                <p className="text-neutral-600 mb-8">
                  Let's get started by collecting your company information and required documents.
                </p>
                <button
                  onClick={() => updateStep(2)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Get Started
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Beautiful Accordion Interface */}
        <OnboardingAccordion
          request={request}
          vendor={vendor}
          documents={documents}
          userDocuments={userDocuments}
          onCompanySubmit={handleCompanyInfoSubmit}
          onDocumentUpload={handleDocumentUpload}
          onDocumentDelete={handleDocumentDelete}
          onDocumentConsent={consentMutation.mutate}
          onComplete={handleComplete}
          isLoading={companyInfoMutation.isPending || completeMutation.isPending}
          isUploading={documentUploadMutation.isPending}
          isConsenting={consentMutation.isPending}
        />
      </main>
    </div>
  );
}
