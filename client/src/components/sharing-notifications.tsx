import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Share2, 
  FileText, 
  User,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

// Types based on our schema
interface SharingNotification {
  id: number;
  fromUserId: number;
  toUserId: number;
  documentId?: number;
  chainId?: number;
  notificationType: 'share_request' | 'share_accepted' | 'share_rejected' | 'chain_complete';
  message: string;
  metadata?: {
    documentTitle?: string;
    fromUserName?: string;
    fromUserCompany?: string;
    shareReason?: string;
    permissions?: {
      canRelay: boolean;
      canView: boolean;
      canDownload: boolean;
    };
  };
  isRead: boolean;
  createdAt: Date;
}

interface SharingNotificationsProps {
  currentUserId: number;
  onNotificationUpdate?: () => void;
}

export function SharingNotifications({
  currentUserId,
  onNotificationUpdate
}: SharingNotificationsProps) {
  const [notifications, setNotifications] = useState<SharingNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, [currentUserId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${currentUserId}/sharing-notifications`);
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
      } else {
        throw new Error(data.error || 'Failed to load notifications');
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        onNotificationUpdate?.();
      } else {
        throw new Error(data.error || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleShareResponse = async (notificationId: number, accept: boolean) => {
    // This would be implemented when we have share request acceptance/rejection endpoints
    try {
      setIsLoading(true);
      
      // Mock API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: accept ? "Share Request Accepted" : "Share Request Rejected",
        description: `You have ${accept ? 'accepted' : 'rejected'} the sharing request`,
      });
      
      // Mark notification as read and update status
      await markAsRead(notificationId);
      
    } catch (error: any) {
      console.error('Error responding to share request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to respond to share request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconProps = { className: `w-5 h-5 ${isRead ? 'text-gray-400' : 'text-blue-500'}` };
    
    switch (type) {
      case 'share_request':
        return <Share2 {...iconProps} />;
      case 'share_accepted':
        return <CheckCircle className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-green-500'}`} />;
      case 'share_rejected':
        return <XCircle className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-red-500'}`} />;
      case 'chain_complete':
        return <FileText {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'share_request':
        return 'Share Request';
      case 'share_accepted':
        return 'Share Accepted';
      case 'share_rejected':
        return 'Share Rejected';
      case 'chain_complete':
        return 'Chain Complete';
      default:
        return 'Notification';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'share_request':
        return 'bg-blue-100 text-blue-800';
      case 'share_accepted':
        return 'bg-green-100 text-green-800';
      case 'share_rejected':
        return 'bg-red-100 text-red-800';
      case 'chain_complete':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5 text-blue-500" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              Sharing Notifications
              {unreadCount > 0 && (
                <Badge className="bg-blue-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated on document sharing activity
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                notifications
                  .filter(n => !n.isRead)
                  .forEach(n => markAsRead(n.id));
              }}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet.</p>
            <p className="text-sm">You'll see sharing activity here.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notificationType, notification.isRead)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getNotificationTypeColor(notification.notificationType)}>
                        {getNotificationTypeLabel(notification.notificationType)}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 h-auto"
                        >
                          <EyeOff className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.metadata && (
                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                        {notification.metadata.documentTitle && (
                          <div className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>Document: {notification.metadata.documentTitle}</span>
                          </div>
                        )}
                        {notification.metadata.fromUserName && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>
                              From: {notification.metadata.fromUserName}
                              {notification.metadata.fromUserCompany && (
                                <span> ({notification.metadata.fromUserCompany})</span>
                              )}
                            </span>
                          </div>
                        )}
                        {notification.metadata.shareReason && (
                          <div>
                            <strong>Reason:</strong> {notification.metadata.shareReason}
                          </div>
                        )}
                        {notification.metadata.permissions && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span>Permissions:</span>
                            {notification.metadata.permissions.canView && (
                              <Badge variant="outline" className="text-xs">View</Badge>
                            )}
                            {notification.metadata.permissions.canDownload && (
                              <Badge variant="outline" className="text-xs">Download</Badge>
                            )}
                            {notification.metadata.permissions.canRelay && (
                              <Badge variant="outline" className="text-xs">Relay</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action buttons for share requests */}
                    {notification.notificationType === 'share_request' && !notification.isRead && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleShareResponse(notification.id, true)}
                          disabled={isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareResponse(notification.id, false)}
                          disabled={isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
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
