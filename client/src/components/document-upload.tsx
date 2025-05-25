import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "@/lib/utils";
import type { Document } from "@shared/schema";

interface DocumentUploadProps {
  documents: Document[];
  onUpload: (file: File, documentType: string) => void;
  onDelete: (documentId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isUploading?: boolean;
  userDocuments?: {
    hasW9: boolean;
    hasInsurance: boolean;
    hasBanking: boolean;
  };
  request?: {
    requesterCompany: string;
  };
  onConsent?: (documentType: string) => void;
  isConsenting?: boolean;
}

const requiredDocuments = [
  {
    type: "w9",
    title: "W-9 Tax Form",
    description: "Required for tax reporting purposes",
    required: true,
    acceptedTypes: ".pdf,.doc,.docx"
  },
  {
    type: "insurance",
    title: "Certificate of Insurance",
    description: "General liability and professional liability coverage",
    required: true,
    acceptedTypes: ".pdf,.jpg,.png"
  },
  {
    type: "banking",
    title: "Banking Information",
    description: "Voided check or bank letter for ACH setup",
    required: false,
    acceptedTypes: ".pdf,.jpg,.png"
  }
];

export function DocumentUpload({ 
  documents, 
  onUpload, 
  onDelete, 
  onNext, 
  onPrevious,
  isUploading,
  userDocuments,
  request,
  onConsent,
  isConsenting 
}: DocumentUploadProps) {
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.documentType === type);
  };

  const hasUserDocument = (type: string) => {
    if (!userDocuments) return false;
    switch (type) {
      case 'w9': return userDocuments.hasW9;
      case 'insurance': return userDocuments.hasInsurance;
      case 'banking': return userDocuments.hasBanking;
      default: return false;
    }
  };

  const handleConsent = (documentType: string) => {
    if (onConsent) {
      onConsent(documentType);
      toast({
        title: "Document shared",
        description: `Your ${documentType} document has been shared with ${request?.requesterCompany}.`
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF, DOC, DOCX, JPG, or PNG file.",
        variant: "destructive"
      });
      return;
    }

    onUpload(file, documentType);
    
    // Reset the input
    if (fileInputRefs.current[documentType]) {
      fileInputRefs.current[documentType]!.value = '';
    }
  };

  const handleDeleteDocument = (documentId: number) => {
    onDelete(documentId);
    toast({
      title: "Document deleted",
      description: "The document has been removed successfully."
    });
  };

  const canProceed = () => {
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    return requiredDocs.every(doc => {
      // Document is complete if either uploaded for this request OR user has shared existing document
      return getDocumentForType(doc.type) || hasUserDocument(doc.type);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload the following documents to complete your vendor profile
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {requiredDocuments.map((docType) => {
          const uploadedDoc = getDocumentForType(docType.type);
          
          return (
            <div key={docType.type} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-neutral-800">{docType.title}</h3>
                  <p className="text-xs text-neutral-600 mt-1">{docType.description}</p>
                </div>
                <Badge variant={docType.required ? "destructive" : "secondary"}>
                  {uploadedDoc ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </>
                  ) : (
                    docType.required ? "Required" : "Optional"
                  )}
                </Badge>
              </div>
              
              {uploadedDoc ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="text-red-500 text-lg mr-3" />
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{uploadedDoc.fileName}</p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(uploadedDoc.fileSize)} • 
                          Uploaded {new Date(uploadedDoc.uploadedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(uploadedDoc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : hasUserDocument(docType.type) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="text-sm font-medium text-neutral-800 mb-2">
                    You've already uploaded a {docType.title}
                  </h4>
                  <p className="text-xs text-neutral-600 mb-4">
                    Would you like to share it with {request?.requesterCompany}?
                  </p>
                  <Button
                    onClick={() => handleConsent(docType.type)}
                    disabled={isConsenting}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isConsenting ? "Sharing..." : "Agree & Share"}
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={(el) => fileInputRefs.current[docType.type] = el}
                    type="file"
                    accept={docType.acceptedTypes}
                    onChange={(e) => handleFileSelect(e, docType.type)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fileInputRefs.current[docType.type]?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="w-8 h-8 text-neutral-400 mb-3" />
                    <div>
                      <p className="text-sm text-neutral-600 mb-2">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-neutral-500">
                        {docType.acceptedTypes.replace(/\./g, '').toUpperCase()} (max 10MB)
                      </p>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        
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
            type="button"
            onClick={onNext}
            disabled={!canProceed() || isUploading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isUploading ? "Uploading..." : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
