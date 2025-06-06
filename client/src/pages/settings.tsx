import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Settings as SettingsIcon, ChevronDown, LogOut, Home as HomeIcon, User, Building, Shield, Bell, CreditCard, Users, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile, isComplete } = useProfile();
  const { toast } = useToast();
  
  // State for form fields
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    mobile: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareData: false,
  });

  const handleLogout = async () => {
    try {
      // Sign out from Supabase and await completion
      await supabase.auth.signOut();

      // Clear local storage
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();

      // Use proper logout endpoint that clears Google OAuth session
      await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      // Force refresh to ensure clean state
      window.location.href = "/logged-out";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/logged-out";
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Settings saved",
      description: "Your privacy settings have been updated.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <h1 className="text-xl font-semibold text-gray-900">Onbo</h1>
            </div>
          </div>

          <nav className="px-6">
            <div className="space-y-2">
              <Button
                variant={location === '/dashboard' || location === '/' ? "secondary" : "ghost"}
                className={`w-full justify-start ${location === '/dashboard' || location === '/'
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setLocation('/dashboard')}
              >
                <HomeIcon className="w-4 h-4 mr-3" />
                Home
              </Button>
              <Button
                variant={location.startsWith('/vendors') ? "secondary" : "ghost"}
                className={`w-full justify-start ${location.startsWith('/vendors')
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setLocation('/vendors')}
              >
                <Users className="w-4 h-4 mr-3" />
                Vendors
              </Button>
              {!isComplete && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 border border-orange-200"
                  onClick={() => setLocation('/profile-setup')}
                >
                  <UserCheck className="w-4 h-4 mr-3" />
                  Complete your profile
                </Button>
              )}
              <Button
                variant={location === '/settings' ? "secondary" : "ghost"}
                className={`w-full justify-start ${location === '/settings'
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setLocation('/settings')}
              >
                <SettingsIcon className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </div>
          </nav>

          {/* User Menu */}
          <div className="absolute bottom-6 left-6 right-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || 'User'
                        }
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/switch-account')}>
                  <Users className="w-4 h-4 mr-2" />
                  Switch Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your account settings and preferences.
              </p>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Update your account details and personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={profile?.firstName || ''}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={profile?.lastName || ''}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      defaultValue={profile?.companyName || ''}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about updates and activities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>                
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked: boolean) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive push notifications in your browser
                      </p>
                    </div>                
                    <Switch
                      id="desktop-notifications"
                      checked={notifications.desktop}
                      onCheckedChange={(checked: boolean) => 
                        setNotifications(prev => ({ ...prev, desktop: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="mobile-notifications">Mobile Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Receive notifications on your mobile device
                      </p>
                    </div>                
                    <Switch
                      id="mobile-notifications"
                      checked={notifications.mobile}
                      onCheckedChange={(checked: boolean) => 
                        setNotifications(prev => ({ ...prev, mobile: checked }))
                      }
                    />
                  </div>
                  <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Manage your privacy settings and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visible">Public Profile</Label>
                      <p className="text-sm text-gray-600">
                        Make your profile visible to other users
                      </p>
                    </div>                
                    <Switch
                      id="profile-visible"
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked: boolean) => 
                        setPrivacy(prev => ({ ...prev, profileVisible: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-data">Data Sharing</Label>
                      <p className="text-sm text-gray-600">
                        Allow anonymized data sharing for analytics
                      </p>
                    </div>                
                    <Switch
                      id="share-data"
                      checked={privacy.shareData}
                      onCheckedChange={(checked: boolean) => 
                        setPrivacy(prev => ({ ...prev, shareData: checked }))
                      }
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Manage account deletion and logout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
