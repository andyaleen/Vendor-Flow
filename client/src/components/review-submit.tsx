import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, FileText, Building, User, Phone, Mail } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { Vendor, Document, OnboardingRequest } from "@shared/schema";

interface ReviewSubmitProps {
  vendor: Vendor;
  documents: Document[];
  request: OnboardingRequest;
  onSubmit: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
}

export function ReviewSubmit({ 
  vendor, 
  documents, 
  request, 
  onSubmit, 
  onPrevious, 
  isSubmitting 
}: ReviewSubmitProps) {
  const requiredDocs = ["w9", "insurance"];
  const allRequiredDocsUploaded = requiredDocs.every(type => 
    documents.some(doc => doc.documentType === type)
  );

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Review & Submit</CardTitle>
          <CardDescription>
            Please review your information before submitting your vendor onboarding
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Request Information */}
          <div>
            <h3 className="text-base font-medium text-neutral-800 mb-3 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Request Information
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-600">Requested by:</span>
                  <p className="text-neutral-800">{request.requesterCompany}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Contact:</span>
                  <p className="text-neutral-800">{request.requesterEmail}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Expires:</span>
                  <p className="text-neutral-800">
                    {new Date(request.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Status:</span>
                  <Badge variant="secondary" className="ml-2">
                    {request.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Information */}
          <div>
            <h3 className="text-base font-medium text-neutral-800 mb-3 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-neutral-600">Legal Name:</span>
                  <p className="text-neutral-800">{vendor.companyName}</p>
                </div>
                {vendor.dbaName && (
                  <div>
                    <span className="font-medium text-neutral-600">DBA Name:</span>
                    <p className="text-neutral-800">{vendor.dbaName}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-neutral-600">Tax ID:</span>
                  <p className="text-neutral-800">{vendor.taxId}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-600">Business Type:</span>
                  <p className="text-neutral-800 capitalize">{vendor.businessType.replace('-', ' ')}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-neutral-600">Address:</span>
                  <p className="text-neutral-800">
                    {vendor.street}<br />
                    {vendor.city}, {vendor.state} {vendor.postalCode}<br />
                    {vendor.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-base font-medium text-neutral-800 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Primary Contact</h4>
                <div className="space-y-2">
                  <p className="text-neutral-800">{vendor.primaryContactName}</p>
                  <p className="text-neutral-600">{vendor.primaryContactTitle}</p>
                  <div className="flex items-center text-neutral-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.primaryContactEmail}
                  </div>
                  <div className="flex items-center text-neutral-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {vendor.primaryContactPhone}
                  </div>
                </div>
              </div>
              
              {vendor.arContactName && vendor.arContactEmail && (
                <div>
                  <h4 className="font-medium text-neutral-700 mb-2">Accounts Receivable Contact</h4>
                  <div className="space-y-2">
                    <p className="text-neutral-800">{vendor.arContactName}</p>
                    <div className="flex items-center text-neutral-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {vendor.arContactEmail}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <h3 className="text-base font-medium text-neutral-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Uploaded Documents
            </h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{doc.fileName}</p>
                      <p className="text-xs text-neutral-500">
                        {doc.documentType.toUpperCase()} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Uploaded</Badge>
                </div>
              ))}
              
              {documents.length === 0 && (
                <p className="text-neutral-500 text-sm">No documents uploaded</p>
              )}
            </div>
          </div>

          {/* Validation Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {allRequiredDocsUploaded ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 bg-yellow-500 rounded-full" />
                )}
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-neutral-800">
                  {allRequiredDocsUploaded ? "Ready to Submit" : "Missing Required Documents"}
                </h4>
                <p className="text-sm text-neutral-600 mt-1">
                  {allRequiredDocsUploaded 
                    ? "All required information and documents have been provided. You can now submit your vendor onboarding."
                    : "Please upload all required documents before submitting."
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <Button 
          type="button" 
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        
        <Button 
          type="button"
          onClick={onSubmit}
          disabled={!allRequiredDocsUploaded || isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Onboarding"}
        </Button>
      </div>
    </div>
  );
}
