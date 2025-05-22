import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  FileText, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Globe,
  Calendar,
  Clock,
  Star
} from "lucide-react";

const trustedCompanies = [
  "COMPASS", "L'OREAL", "Zendesk", "Dropbox", "GONG", "Carnival", 
  "INDIANA UNIVERSITY", "DOORDASH", "NHL"
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VendorFlow</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-1">
                <span className="text-gray-700">Product</span>
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700">Solutions</span>
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
              <span className="text-gray-700">Enterprise</span>
              <div className="flex items-center space-x-1">
                <span className="text-gray-700">Resources</span>
                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
              <span className="text-gray-700">Pricing</span>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>English</span>
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">Talk to sales</span>
              <Button variant="ghost" size="sm">
                Log in
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/api/login'}
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Easy
                  <br />
                  vendor onboarding
                  <br />
                  ahead
                </h1>
                
                <p className="text-xl text-gray-600 max-w-md">
                  Join 20 million professionals who easily onboard vendors with the #1 vendor management tool.
                </p>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-4">
                <Button 
                  className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  onClick={() => window.location.href = '/api/login'}
                >
                  <div className="w-5 h-5 bg-white rounded mr-3 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">R</span>
                  </div>
                  Sign up with Replit
                </Button>
                
                <div className="flex items-center max-w-sm">
                  <div className="flex-1 border-t border-gray-300" />
                  <span className="px-4 text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-300" />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full max-w-sm border-gray-300 h-12 text-base font-medium"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign up free with email
                </Button>
                
                <p className="text-sm text-gray-600 max-w-sm">
                  No credit card required
                </p>
              </div>
            </div>

            {/* Right side - Demo Interface */}
            <div className="relative">
              {/* Demo Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Share your vendor onboarding</h3>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">ACME Inc.</p>
                      <p className="text-sm text-gray-600">Vendor Onboarding Portal</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Select a Date & Time</span>
                    </div>
                    
                    {/* Mini Calendar */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
                      <div className="text-gray-500 p-1">SUN</div>
                      <div className="text-gray-500 p-1">MON</div>
                      <div className="text-gray-500 p-1">TUE</div>
                      <div className="text-gray-500 p-1">WED</div>
                      <div className="text-gray-500 p-1">THU</div>
                      <div className="text-gray-500 p-1">FRI</div>
                      <div className="text-gray-500 p-1">SAT</div>
                      
                      {Array.from({ length: 35 }, (_, i) => (
                        <div key={i} className={`p-1 ${i === 15 ? 'bg-blue-600 text-white rounded' : 'text-gray-700'}`}>
                          {i > 5 && i < 31 ? i - 5 : ''}
                        </div>
                      ))}
                    </div>
                    
                    {/* Time slots */}
                    <div className="space-y-2">
                      <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm text-center">
                        10:00am
                      </div>
                      <div className="bg-gray-200 px-3 py-2 rounded text-sm text-center text-gray-700">
                        1:00pm
                      </div>
                      <div className="bg-gray-200 px-3 py-2 rounded text-sm text-center text-gray-700">
                        4:00pm
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Miami time - US Eastern
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trusted by section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-8">
              Trusted by more than <span className="font-semibold">100,000</span> of the world's leading organizations
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-8 items-center opacity-60">
              {trustedCompanies.map((company) => (
                <div key={company} className="text-center">
                  <span className="text-sm font-medium text-gray-500">{company}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to onboard vendors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your vendor management process with secure, automated onboarding that saves time and reduces manual work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Compliant</h3>
              <p className="text-gray-600">
                Bank-level security with encrypted data transmission and secure document storage that meets enterprise compliance standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Collection</h3>
              <p className="text-gray-600">
                Automatically collect W-9s, insurance certificates, banking information, and other required documents with validation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Collaboration</h3>
              <p className="text-gray-600">
                Send secure onboarding links to vendors and track progress in real-time with automated notifications and reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your vendor onboarding?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies that trust VendorFlow for their vendor management needs.
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            Get started for free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VendorFlow</span>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <span>© 2024 VendorFlow</span>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}