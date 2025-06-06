import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Building, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
  UserCheck,
  HomeIcon
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

// Mock data for vendors - in a real app, this would come from an API
const mockVendors = [
  {
    id: 1,
    name: "TechFlow Solutions",
    email: "contact@techflow.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    status: "active",
    onboardingStatus: "completed",
    dateAdded: "2024-01-15",
    category: "Technology",
    contactPerson: "John Smith"
  },
  {
    id: 2,
    name: "Global Marketing Inc",
    email: "hello@globalmarketing.com",
    phone: "+1 (555) 987-6543",
    location: "New York, NY",
    status: "pending",
    onboardingStatus: "in-progress",
    dateAdded: "2024-01-20",
    category: "Marketing",
    contactPerson: "Sarah Johnson"
  },
  {
    id: 3,
    name: "SecureIT Services",
    email: "info@secureit.com",
    phone: "+1 (555) 456-7890",
    location: "Austin, TX",
    status: "active",
    onboardingStatus: "completed",
    dateAdded: "2024-01-10",
    category: "Security",
    contactPerson: "Mike Davis"
  },
  {
    id: 4,
    name: "CloudData Systems",
    email: "support@clouddata.com",
    phone: "+1 (555) 321-0987",
    location: "Seattle, WA",
    status: "inactive",
    onboardingStatus: "not-started",
    dateAdded: "2024-01-25",
    category: "Data Services",
    contactPerson: "Lisa Chen"
  }
];

export default function Vendors() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter vendors based on search and status
  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOnboardingStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "not-started":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
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
              <Button
                variant={location === '/settings' ? "secondary" : "ghost"}
                className={`w-full justify-start ${location === '/settings'
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                onClick={() => setLocation('/settings')}
              >
                <Settings className="w-4 h-4 mr-3" />
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
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    localStorage.removeItem("supabase.auth.token");
                    sessionStorage.clear();
                    await fetch("/api/auth/logout", {
                      method: "GET",
                      credentials: "include",
                    });
                    window.location.href = "/logged-out";
                  } catch (error) {
                    console.error("Logout error:", error);
                    window.location.href = "/logged-out";
                  }
                }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
                <p className="text-gray-600 mt-1">Manage your vendor relationships and onboarding</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">{mockVendors.length}</p>
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
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockVendors.filter(v => v.status === 'active').length}
                      </p>
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
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockVendors.filter(v => v.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Building className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Onboarded</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockVendors.filter(v => v.onboardingStatus === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Vendors List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{vendor.name}</CardTitle>
                          <CardDescription>{vendor.category}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                          <DropdownMenuItem>Send Onboarding</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Remove Vendor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        {getStatusBadge(vendor.status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Onboarding</span>
                        <div className="flex items-center space-x-2">
                          {getOnboardingStatusIcon(vendor.onboardingStatus)}
                          <span className="text-sm text-gray-700 capitalize">
                            {vendor.onboardingStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <User className="w-3 h-3 mr-2" />
                          {vendor.contactPerson}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Mail className="w-3 h-3 mr-2" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Phone className="w-3 h-3 mr-2" />
                          {vendor.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-2" />
                          {vendor.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredVendors.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first vendor to begin the onboarding process"
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Vendor
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
