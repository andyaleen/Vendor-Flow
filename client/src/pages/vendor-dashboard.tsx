import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, FileText, Clock, CheckCircle, User, Mail, Phone } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { Vendor, Document, OnboardingRequest } from "@shared/schema";

export default function VendorDashboard() {
  // This would typically get the vendor ID from auth context
  // For now, we'll show a placeholder
  
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
              <span className="text-sm text-neutral-600">Vendor Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Vendor Dashboard</h1>
          <p className="text-neutral-600">Manage your vendor profile and onboarding requests</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Active Requests</p>
                  <p className="text-2xl font-bold text-neutral-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending</p>
                  <p className="text-2xl font-bold text-neutral-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No onboarding requests yet</h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            When you receive onboarding requests from companies, they will appear here. 
            You'll be able to manage your vendor profile and complete required documentation.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
            <div className="text-left text-blue-700 text-sm space-y-2">
              <div className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                <span>Companies will send you secure onboarding links via email</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">2.</span>
                <span>Click the link to access the onboarding portal</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">3.</span>
                <span>Complete your company information and upload required documents</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">4.</span>
                <span>Review and submit your onboarding information</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
