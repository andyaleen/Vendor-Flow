import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Building, Mail, Phone, CreditCard, FileText, X, Plus, Users, Settings, ChevronDown, LogOut, Home as HomeIcon } from "lucide-react";

// Define all available field options
const fieldLibrary = {
  "company_info": {
    label: "Company Information",
    icon: Building,
    subFields: [
      { id: "company_name", label: "Company Name", type: "text", required: true },
      { id: "legal_business_name", label: "Legal Business Name", type: "text", required: false },
      { id: "tax_id", label: "Taxpayer Identification Number", type: "number", required: false },
      { id: "billing_address", label: "Billing Address", type: "address", required: false },
      { id: "shipping_address", label: "Shipping Address", type: "address", required: false },
      { id: "payment_terms", label: "Payment Terms", type: "text", required: false },
      { id: "legal_entity_type", label: "Type of Legal Entity", type: "text", required: false },
      { id: "year_established", label: "Year Established", type: "number", required: false },
      { id: "duns_number", label: "D&B Number", type: "number", required: false },
      { id: "sales_tax_exempt", label: "Sales and Use Tax Exempt", type: "checkbox", required: false },
      { id: "dba_name", label: "DBA Name", type: "text", required: false },
    ]
  },
  "contact_info": {
    label: "Primary Contact Information", 
    icon: Mail,
    subFields: [
      { id: "contact_name", label: "Contact Name", type: "text", required: true },
      { id: "contact_email", label: "Contact Email", type: "email", required: true },
      { id: "contact_phone", label: "Contact Phone Number", type: "phone", required: false },
      { id: "contact_title", label: "Contact Title", type: "text", required: false },
      { id: "contact_fax", label: "Fax Number", type: "phone", required: false },
    ]
  }
};

export default function EditEventType() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedFields, setSelectedFields] = useState([
    { fieldId: "company_info", subFieldId: "company_name", required: true },
    { fieldId: "company_info", subFieldId: "legal_business_name", required: false },
    { fieldId: "company_info", subFieldId: "tax_id", required: false },
    { fieldId: "contact_info", subFieldId: "contact_name", required: true },
    { fieldId: "contact_info", subFieldId: "contact_email", required: true },
    { fieldId: "contact_info", subFieldId: "contact_phone", required: false },
  ]);

  const toggleRequired = (fieldId: string, subFieldId: string) => {
    setSelectedFields(prev => 
      prev.map(field => 
        field.fieldId === fieldId && field.subFieldId === subFieldId
          ? { ...field, required: !field.required }
          : field
      )
    );
  };

  const removeField = (fieldId: string, subFieldId: string) => {
    setSelectedFields(prev => 
      prev.filter(field => !(field.fieldId === fieldId && field.subFieldId === subFieldId))
    );
  };

  const getFieldInfo = (fieldId: string, subFieldId: string) => {
    const category = fieldLibrary[fieldId as keyof typeof fieldLibrary];
    const field = category?.subFields.find(f => f.id === subFieldId);
    return { category, field };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to VendorFlow</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/api/login')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">VendorFlow</h1>
            </div>
          </div>
          
          <nav className="px-6">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setLocation('/')}
              >
                <HomeIcon className="w-4 h-4 mr-3" />
                Home
              </Button>
              <Button variant="secondary" className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
                <Users className="w-4 h-4 mr-3" />
                Vendors
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600">
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation('/api/logout')}>
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/dashboard')}
                  className="mb-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  ← Back to Event Types
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Basic Vendor Setup</h1>
                <p className="text-gray-600 mt-1">Configure what information you want to collect from vendors</p>
              </div>
            </div>

            {/* Field Categories */}
            <div className="space-y-8">
              {Object.entries(fieldLibrary).map(([categoryId, category]) => {
                const categoryFields = selectedFields.filter(f => f.fieldId === categoryId);
                
                return (
                  <Card key={categoryId} className="border border-gray-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <category.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-medium text-gray-900">
                            {category.label}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {categoryFields.length} fields selected
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {categoryFields.map((selectedField) => {
                          const { field } = getFieldInfo(selectedField.fieldId, selectedField.subFieldId);
                          if (!field) return null;
                          
                          return (
                            <div key={`${selectedField.fieldId}-${selectedField.subFieldId}`} 
                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center flex-1">
                                <span className="text-sm font-medium text-gray-900 flex-1">
                                  {field.label}
                                </span>
                                <div className="flex-1 flex justify-center">
                                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
                                    {field.type}
                                  </Badge>
                                </div>
                                <div className="flex-1 flex justify-end">
                                  {selectedField.required ? (
                                    <Badge variant="default" className="bg-blue-600 text-white text-xs">
                                      Required
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-gray-600 text-xs">
                                      Optional
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRequired(selectedField.fieldId, selectedField.subFieldId)}
                                  className="text-xs"
                                >
                                  Mark {selectedField.required ? 'optional' : 'required'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeField(selectedField.fieldId, selectedField.subFieldId)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Add field dropdown for this category */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full border-dashed">
                              <Plus className="w-4 h-4 mr-2" />
                              Add field to {category.label}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            {category.subFields
                              .filter(subField => !selectedFields.some(sf => sf.fieldId === categoryId && sf.subFieldId === subField.id))
                              .map((subField) => (
                                <DropdownMenuItem
                                  key={subField.id}
                                  onClick={() => setSelectedFields(prev => [...prev, { 
                                    fieldId: categoryId, 
                                    subFieldId: subField.id, 
                                    required: subField.required 
                                  }])}
                                >
                                  {subField.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Save Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
              <Button variant="outline" onClick={() => setLocation('/dashboard')}>
                Cancel
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline">
                  Preview
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}