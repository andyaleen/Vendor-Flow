import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LoggedOut() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/");
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You've been logged out
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your session has been successfully cleared. You'll be redirected to the home page shortly.
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}