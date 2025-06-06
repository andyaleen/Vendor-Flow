import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Share2, 
  Users, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  User,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

// Types based on our API responses
interface ChainUser {
  id: number;
  name: string;
  company: string;
  email?: string;
}

interface SharingChainItem {
  id: number;
  fromUser: ChainUser;
  toUser: ChainUser;
  sharedAt: Date;
  status: 'active' | 'revoked' | 'expired';
  shareReason?: string;
  permissions: {
    canRelay: boolean;
    canView: boolean;
    canDownload: boolean;
  };
}

interface DocumentSharingChainProps {
  documentId: number;
  documentTitle: string;
  currentUserId: number;
  onShareDocument?: (toUserId: number, shareReason?: string) => void;
  onRevokeChain?: (chainId: number) => void;
}

export function DocumentSharingChain({
  documentId,
  documentTitle,
  currentUserId,
  onShareDocument,
  onRevokeChain
}: DocumentSharingChainProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [chainHistory, setChainHistory] = useState<SharingChainItem[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareReason, setShareReason] = useState('');
  const { toast } = useToast();

  // Load chain history on component mount
  React.useEffect(() => {
    loadChainHistory();
  }, [documentId]);

  const loadChainHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${documentId}/chain-history`);
      const data = await response.json();
      
      if (response.ok) {
        setChainHistory(data.chainHistory || []);
      } else {
        throw new Error(data.error || 'Failed to load chain history');
      }
    } catch (error: any) {
      console.error('Error loading chain history:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sharing history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareDocument = async () => {
    if (!shareEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // First get user ID by email (in real implementation, this would be a proper user lookup)
      const mockUserId = Math.floor(Math.random() * 1000) + 100;
      
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          toUserId: mockUserId,
          shareReason: shareReason.trim() || undefined,
          permissions: {
            canRelay: true,
            canView: true,
            canDownload: true,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Document Shared",
          description: `Document shared successfully with ${shareEmail}`,
        });
        setIsShareDialogOpen(false);
        setShareEmail('');
        setShareReason('');
        loadChainHistory(); // Refresh the chain history
      } else {
        throw new Error(data.error || 'Failed to share document');
      }
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to share document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeChain = async (chainId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/chains/${chainId}/revoke`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Chain Revoked",
          description: "Sharing chain has been revoked successfully",
        });
        loadChainHistory(); // Refresh the chain history
      } else {
        throw new Error(data.error || 'Failed to revoke chain');
      }
    } catch (error: any) {
      console.error('Error revoking chain:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke sharing chain",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'revoked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Document Sharing Chain
            </CardTitle>
            <CardDescription>
              Track how "{documentTitle}" has been shared across users
            </CardDescription>
          </div>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="w-4 h-4 mr-2" />
                Share Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
                <DialogDescription>
                  Share "{documentTitle}" with another user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shareEmail">Recipient Email</Label>
                  <Input
                    id="shareEmail"
                    type="email"
                    placeholder="user@company.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shareReason">Reason for Sharing (Optional)</Label>
                  <Input
                    id="shareReason"
                    placeholder="e.g., Required for vendor onboarding"
                    value={shareReason}
                    onChange={(e) => setShareReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsShareDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleShareDocument} disabled={isLoading}>
                    {isLoading ? "Sharing..." : "Share Document"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && chainHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : chainHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>This document hasn't been shared yet.</p>
            <p className="text-sm">Start sharing to create a chain!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chainHistory.map((chain, index) => (
              <div key={chain.id} className="relative">
                {/* Connection line */}
                {index < chainHistory.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(chain.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{chain.fromUser.name}</span>
                        <span className="text-sm text-gray-500">
                          ({chain.fromUser.company})
                        </span>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{chain.toUser.name}</span>
                        <span className="text-sm text-gray-500">
                          ({chain.toUser.company})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatDate(chain.sharedAt)}</span>
                      <Badge className={getStatusColor(chain.status)}>
                        {chain.status}
                      </Badge>
                      
                      {/* Permissions */}
                      <div className="flex items-center space-x-2">
                        {chain.permissions.canView && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Badge>
                        )}
                        {chain.permissions.canDownload && (
                          <Badge variant="outline" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Badge>
                        )}
                        {chain.permissions.canRelay && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="w-3 h-3 mr-1" />
                            Relay
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {chain.shareReason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Reason:</strong> {chain.shareReason}
                      </p>
                    )}
                  </div>
                  
                  {chain.status === 'active' && onRevokeChain && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeChain(chain.id)}
                      disabled={isLoading}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
