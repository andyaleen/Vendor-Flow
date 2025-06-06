import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit3, 
  Trash2,
  User,
  Building,
  FileText,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types based on our schema
interface SharingPermission {
  id: number;
  granterUserId: number;
  granteeUserId: number;
  documentTypes: string[];
  canRelay: boolean;
  canViewHistory: boolean;
  maxChainDepth: number;
  status: 'active' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
  granteeUser?: {
    id: number;
    name: string;
    email: string;
    company: string;
  };
}

interface SharingPermissionsManagerProps {
  currentUserId: number;
  onPermissionUpdated?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'w9', label: 'W-9 Tax Forms' },
  { value: 'insurance', label: 'Insurance Certificates' },
  { value: 'banking', label: 'Banking Information' },
  { value: 'all', label: 'All Document Types' },
];

export function SharingPermissionsManager({
  currentUserId,
  onPermissionUpdated
}: SharingPermissionsManagerProps) {
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<SharingPermission | null>(null);
  
  // Form state
  const [granteeEmail, setGranteeEmail] = useState('');
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>(['all']);
  const [canRelay, setCanRelay] = useState(true);
  const [canViewHistory, setCanViewHistory] = useState(false);
  const [maxChainDepth, setMaxChainDepth] = useState(3);
  
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, [currentUserId]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${currentUserId}/sharing-permissions`);
      const data = await response.json();
      
      if (response.ok) {
        setPermissions(data.permissions || []);
      } else {
        throw new Error(data.error || 'Failed to load permissions');
      }
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sharing permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setGranteeEmail('');
    setSelectedDocumentTypes(['all']);
    setCanRelay(true);
    setCanViewHistory(false);
    setMaxChainDepth(3);
    setEditingPermission(null);
  };

  const openEditDialog = (permission: SharingPermission) => {
    setEditingPermission(permission);
    setGranteeEmail(permission.granteeUser?.email || '');
    setSelectedDocumentTypes(permission.documentTypes);
    setCanRelay(permission.canRelay);
    setCanViewHistory(permission.canViewHistory);
    setMaxChainDepth(permission.maxChainDepth);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!granteeEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    if (selectedDocumentTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document type",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // For demo purposes, mock a user ID lookup
      const mockGranteeUserId = Math.floor(Math.random() * 1000) + 100;
      
      const permissionData = {
        granterUserId: currentUserId,
        granteeUserId: mockGranteeUserId,
        documentTypes: selectedDocumentTypes,
        canRelay,
        canViewHistory,
        maxChainDepth,
        status: 'active'
      };

      let response;
      if (editingPermission) {
        // Update existing permission
        response = await fetch(`/api/users/${currentUserId}/sharing-permissions/${editingPermission.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permissionData),
        });
      } else {
        // Create new permission (this endpoint doesn't exist in our current implementation but would be needed)
        response = await fetch(`/api/users/${currentUserId}/sharing-permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(permissionData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        toast({
          title: editingPermission ? "Permission Updated" : "Permission Created",
          description: `Sharing permission ${editingPermission ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
        loadPermissions();
        onPermissionUpdated?.();
      } else {
        throw new Error(data.error || `Failed to ${editingPermission ? 'update' : 'create'} permission`);
      }
    } catch (error: any) {
      console.error('Error saving permission:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingPermission ? 'update' : 'create'} permission`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePermission = async (permissionId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/users/${currentUserId}/sharing-permissions/${permissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'revoked'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Permission Revoked",
          description: "Sharing permission has been revoked successfully",
        });
        loadPermissions();
        onPermissionUpdated?.();
      } else {
        throw new Error(data.error || 'Failed to revoke permission');
      }
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke permission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTypeLabels = (types: string[]) => {
    return types.map(type => {
      const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
      return docType ? docType.label : type;
    }).join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
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
              <Shield className="w-5 h-5" />
              Sharing Permissions
            </CardTitle>
            <CardDescription>
              Manage who can access and share your documents
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? 'Edit' : 'Create'} Sharing Permission
                </DialogTitle>
                <DialogDescription>
                  Define what documents a user can access and share
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="granteeEmail">User Email</Label>
                  <Input
                    id="granteeEmail"
                    type="email"
                    placeholder="user@company.com"
                    value={granteeEmail}
                    onChange={(e) => setGranteeEmail(e.target.value)}
                    disabled={!!editingPermission}
                  />
                  {editingPermission && (
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed when editing
                    </p>
                  )}
                </div>

                <div>
                  <Label>Document Types</Label>
                  <div className="mt-2 space-y-2">
                    {DOCUMENT_TYPES.map((docType) => (
                      <div key={docType.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`docType_${docType.value}`}
                          checked={selectedDocumentTypes.includes(docType.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (docType.value === 'all') {
                                setSelectedDocumentTypes(['all']);
                              } else {
                                setSelectedDocumentTypes(prev => 
                                  prev.filter(t => t !== 'all').concat(docType.value)
                                );
                              }
                            } else {
                              setSelectedDocumentTypes(prev => 
                                prev.filter(t => t !== docType.value)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`docType_${docType.value}`} className="text-sm">
                          {docType.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canRelay">Can Relay Documents</Label>
                      <p className="text-sm text-gray-500">
                        Allow user to share documents with others
                      </p>
                    </div>
                    <Switch
                      id="canRelay"
                      checked={canRelay}
                      onCheckedChange={setCanRelay}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="canViewHistory">Can View History</Label>
                      <p className="text-sm text-gray-500">
                        Allow user to see sharing chain history
                      </p>
                    </div>
                    <Switch
                      id="canViewHistory"
                      checked={canViewHistory}
                      onCheckedChange={setCanViewHistory}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxChainDepth">Maximum Chain Depth</Label>
                  <Select value={maxChainDepth.toString()} onValueChange={(value) => setMaxChainDepth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (Direct sharing only)</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="-1">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    How many times documents can be re-shared
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Saving..." : (editingPermission ? "Update" : "Create")} Permission
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && permissions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No sharing permissions configured.</p>
            <p className="text-sm">Add permissions to control document access.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {permission.granteeUser?.name || 'Unknown User'}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({permission.granteeUser?.email})
                      </span>
                      <Badge className={getStatusColor(permission.status)}>
                        {permission.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Documents: {getDocumentTypeLabels(permission.documentTypes)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span>Can Relay:</span>
                          <span className={permission.canRelay ? 'text-green-600' : 'text-red-600'}>
                            {permission.canRelay ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>View History:</span>
                          <span className={permission.canViewHistory ? 'text-green-600' : 'text-red-600'}>
                            {permission.canViewHistory ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Max Depth:</span>
                          <span>{permission.maxChainDepth === -1 ? 'Unlimited' : permission.maxChainDepth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {permission.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(permission)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokePermission(permission.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
