import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Upload, CheckCircle } from "lucide-react";
import { CompanyInfoForm } from "@/components/company-info-form";
import { DocumentUpload } from "@/components/document-upload";
import type { OnboardingRequest, Vendor, Document, CompanyInfoFormData } from "@shared/schema";

interface OnboardingAccordionProps {
  request: OnboardingRequest;
  vendor?: Vendor;
  documents: Document[];
  onCompanySubmit: (data: CompanyInfoFormData) => void;
  onDocumentUpload: (file: File, documentType: string) => void;
  onDocumentDelete: (documentId: number) => void;
  onComplete: () => void;
  isLoading?: boolean;
  isUploading?: boolean;
}

export function OnboardingAccordion({
  request,
  vendor,
  documents,
  onCompanySubmit,
  onDocumentUpload,
  onDocumentDelete,
  onComplete,
  isLoading,
  isUploading
}: OnboardingAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>("company_info");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  const markCompleted = (sectionId: string) => {
    setCompletedSections(prev => new Set([...Array.from(prev), sectionId]));
  };

  const handleCompanySubmit = (data: CompanyInfoFormData) => {
    onCompanySubmit(data);
    markCompleted("company_info");
    setOpenSection("documents");
  };

  const handleAgreeAndShare = async (docType: string) => {
    try {
      // Record the consent in backend
      await fetch('/api/onboarding-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          doc_type: docType,
          agreed_at: new Date().toISOString()
        })
      });
      
      // Mark this section as complete
      markCompleted(`${docType}_shared`);
      
      // Auto-advance to next section if all documents are handled
      const allDocumentsComplete = request.requestedFields
        .filter(field => ["w9_tax", "insurance", "banking"].includes(field))
        .every(field => completedSections.has(`${field}_shared`) || completedSections.has(field));
        
      if (allDocumentsComplete) {
        setOpenSection("review");
      }
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const getSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "company_info":
        return (
          <div className="space-y-4">
            <CompanyInfoForm 
              onSubmit={handleCompanySubmit}
              onNext={() => setOpenSection("documents")}
              onPrevious={() => {}}
              isLoading={isLoading}
              initialData={vendor ? {
                companyName: vendor.companyName || "",
                dbaName: vendor.dbaName || "",
                taxId: vendor.taxId || "",
                businessType: vendor.businessType || "",
                address: vendor.address || {
                  street: "",
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "US"
                },
                primaryContact: vendor.primaryContact || {
                  name: "",
                  title: "",
                  email: "",
                  phone: ""
                },
                arContact: vendor.arContact || {
                  name: "",
                  email: ""
                }
              } : undefined}
            />
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            {/* W-9 Tax Document Section */}
            {request.requestedFields.includes("w9_tax") && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">W-9 Tax Form</h4>
                {vendor?.hasW9OnFile ? (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-blue-800 mb-3">
                      You've already uploaded a W-9. Would you like to share it with {request.requesterCompany}?
                    </p>
                    <Button 
                      onClick={() => handleAgreeAndShare("w9")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Agree & Share
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Upload your W-9 tax form</p>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files && onDocumentUpload(e.target.files[0], "w9")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Insurance Certificate Section */}
            {request.requestedFields.includes("insurance") && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Certificate of Insurance</h4>
                {vendor?.hasInsuranceOnFile ? (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-blue-800 mb-3">
                      You've already uploaded insurance certificates. Would you like to share them with {request.requesterCompany}?
                    </p>
                    <Button 
                      onClick={() => handleAgreeAndShare("insurance")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Agree & Share
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Upload your insurance certificate</p>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => e.target.files && onDocumentUpload(e.target.files[0], "insurance")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Banking Information Section */}
            {request.requestedFields.includes("banking") && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Banking Information</h4>
                {vendor?.hasBankingOnFile ? (
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-blue-800 mb-3">
                      You've already provided banking details. Would you like to share them with {request.requesterCompany}?
                    </p>
                    <Button 
                      onClick={() => handleAgreeAndShare("banking")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Agree & Share
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Upload your banking information</p>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files && onDocumentUpload(e.target.files[0], "banking")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Ready to Submit</h3>
              <p className="text-sm text-green-700">
                Please review all your information and documents before submitting your onboarding request.
              </p>
              <Button 
                onClick={onComplete} 
                disabled={isLoading}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Submitting..." : "Complete Onboarding"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sections = [
    {
      id: "company_info",
      title: "Company Information",
      description: "Basic company details and contact information",
      required: request.requestedFields.includes("company_info"),
    },
    {
      id: "documents", 
      title: "Document Upload",
      description: "Required documents for onboarding",
      required: request.requestedFields.some(field => 
        ["w9_tax", "insurance", "banking", "license"].includes(field)
      ),
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Final review before submission",
      required: true,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow-sm p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-2">
          {request.requesterCompany} Vendor Onboarding
        </h2>
        <p className="text-gray-600">
          Complete the sections below to finish your vendor registration with {request.requesterCompany}.
        </p>
      </div>

      {/* Accordion Sections */}
      {sections.map((section) => {
        const isCompleted = completedSections.has(section.id);
        const isOpen = openSection === section.id;
        
        return (
          <div key={section.id} className="bg-white shadow-sm rounded-lg border">
            <button
              onClick={() => toggle(section.id)}
              className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? "bg-green-100 text-green-600" 
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={16} />
                  ) : (
                    <span className="text-sm font-medium">
                      {sections.findIndex(s => s.id === section.id) + 1}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {section.required && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    Required
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    Complete
                  </span>
                )}
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t px-6 py-6 bg-gray-50">
                {getSectionContent(section.id)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}