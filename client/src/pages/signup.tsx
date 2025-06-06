import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    if (email.length < 5) {
      return "Email address is too short";
    }

    const [username] = email.split('@');
    const problematicPatterns = ['local', 'test', 'admin', 'user', 'demo', 'temp', 'example', 'sample'];
    
    if (problematicPatterns.some(pattern => username.toLowerCase().includes(pattern)) && username.length < 6) {
      return "Please use a more personal email address. Generic usernames are often rejected.";
    }

    if (username.length < 2) {
      return "Email username must be at least 2 characters long";
    }

    if (username.length < 4 && !username.includes('.') && !username.includes('_')) {
      return "Please use a more complete email address (e.g., john.doe@gmail.com)";
    }

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!email || !password || !firstName.trim() || !lastName.trim() || !companyName.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Email validation
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      setLoading(false);

      if (error) {
        // Provide specific error messages based on error type
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          setError("This email address is not accepted by our authentication provider. Please try using a different email with a more complete username. Avoid generic terms like 'local', 'test', 'user', etc.");
        } else if (error.message.includes('User already registered')) {
          setError("An account with this email already exists. Please try signing in instead.");
        } else if (error.message.includes('Password')) {
          setError("Password doesn't meet requirements. Please use at least 6 characters.");
        } else {
          setError(`Signup failed: ${error.message}`);
        }
      } else {
        // Handle successful signup
        if (data.user && !data.session) {
          alert("Please check your email and click the confirmation link to activate your account.");
          setLocation("/login");

        } else if (data.session && data.user) {
          // Create user profile in database after successful auth signup
          try {
            const response = await fetch('/api/user/setup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: trimmedEmail,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                companyName: companyName.trim(),
                supabaseUserId: data.user.id,
              }),
            });

            if (response.ok) {
              alert("Account created successfully!");
              setLocation("/dashboard");
            } else {
              console.error("Failed to create user profile");
              alert("Account created but profile setup failed. Please contact support.");
              setLocation("/login");
            }
          } catch (profileError) {
            console.error("Error creating user profile:", profileError);
            alert("Account created but profile setup failed. Please contact support.");
            setLocation("/login");
          }
        } else {
          alert("Account created successfully! Please sign in.");
          setLocation("/login");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up for VendorFlow to manage your vendor onboarding
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Company Name"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email (e.g., john.doe@gmail.com)"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a complete email address.
              </p>
            </div>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={() => setLocation("/login")}
                className="text-blue-600 hover:underline"
              >
                Sign in here
              </button>
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Email Tips:</strong> Use a personal email address like john.doe@gmail.com.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}