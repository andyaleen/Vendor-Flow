import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Shield, 
  Bell, 
  FileText, 
  Users, 
  Activity,
  TrendingUp,
  Eye,
  Download
} from "lucide-react";
import { DocumentSharingChain } from "@/components/document-sharing-chain";
import { SharingPermissionsManager } from "@/components/sharing-permissions-manager";
import { SharingNotifications } from "@/components/sharing-notifications";

interface ChainSharingDashboardProps {
  currentUserId: number;
  userName: string;
  userCompany: string;
}

// Mock data for demonstration
const mockDocuments = [
  {
    id: 1,
    title: "W-9 Tax Form - 2024",
    type: "w9",
    uploadedAt: new Date("2024-01-15"),
    sharingEnabled: true,
    totalShares: 3,
    activeChains: 2
  },
  {
    id: 2,
    title: "General Liability Insurance Certificate",
    type: "insurance",
    uploadedAt: new Date("2024-01-20"),
    sharingEnabled: true,
    totalShares: 1,
    activeChains: 1
  },
  {
    id: 3,
    title: "Banking Information - ACH Details",
    type: "banking",
    uploadedAt: new Date("2024-01-25"),
    sharingEnabled: false,
    totalShares: 0,
    activeChains: 0
  }
];

const mockStats = {
  totalDocumentsShared: 2,
  totalActiveChains: 3,
  totalRecipients: 5,
  pendingRequests: 2,
  thisMonthShares: 8,
  shareGrowth: 23 // percentage
};

export function ChainSharingDashboard({
  currentUserId,
  userName,
  userCompany
}: ChainSharingDashboardProps) {
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chain Sharing Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {userName} from {userCompany}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Share2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Chains</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalActiveChains}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalRecipients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Bell className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.pendingRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{mockStats.thisMonthShares}</p>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    +{mockStats.shareGrowth}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="chains" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Sharing Chains</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Your Shareable Documents</CardTitle>
              <CardDescription>
                Manage and track your documents that can be shared through chains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <h3 className="font-medium">{doc.title}</h3>
                          <Badge variant={doc.sharingEnabled ? "default" : "secondary"}>
                            {doc.sharingEnabled ? "Sharing Enabled" : "Sharing Disabled"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Uploaded: {doc.uploadedAt.toLocaleDateString()}</span>
                          <span>Total Shares: {doc.totalShares}</span>
                          <span>Active Chains: {doc.activeChains}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(doc.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Chain
                        </Button>
                        {doc.sharingEnabled && (
                          <Button size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sharing Chains Tab */}
        <TabsContent value="chains">
          <div className="space-y-6">
            {/* Document Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Document to View Chain</CardTitle>
                <CardDescription>
                  Choose a document to see its complete sharing chain history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockDocuments.filter(doc => doc.sharingEnabled).map((doc) => (
                    <Button
                      key={doc.id}
                      variant={selectedDocument === doc.id ? "default" : "outline"}
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => setSelectedDocument(doc.id)}
                    >
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {doc.activeChains} active chains
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chain Visualization */}
            {selectedDocument && (
              <DocumentSharingChain
                key={`${selectedDocument}-${refreshTrigger}`}
                documentId={selectedDocument}
                documentTitle={mockDocuments.find(d => d.id === selectedDocument)?.title || "Document"}
                currentUserId={currentUserId}
                onShareDocument={(toUserId, shareReason) => {
                  console.log('Sharing document to user:', toUserId, 'reason:', shareReason);
                  handleRefresh();
                }}
                onRevokeChain={(chainId) => {
                  console.log('Revoking chain:', chainId);
                  handleRefresh();
                }}
              />
            )}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <SharingPermissionsManager
            key={refreshTrigger}
            currentUserId={currentUserId}
            onPermissionUpdated={handleRefresh}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <SharingNotifications
            key={refreshTrigger}
            currentUserId={currentUserId}
            onNotificationUpdate={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
