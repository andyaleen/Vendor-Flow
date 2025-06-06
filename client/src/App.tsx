import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Lazy load components for better code splitting
const Landing = lazy(() => import("@/pages/landing"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Home = lazy(() => import("@/pages/home"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const UserOnboarding = lazy(() => import("@/pages/user-onboarding"));
const LoggedOut = lazy(() => import("@/pages/logged-out"));
const VendorOnboarding = lazy(() => import("@/components/VendorOnboarding"));
const AuthCallback = lazy(() => import("@/pages/auth/callback"));
const EditEventType = lazy(() => import("@/pages/edit-event-type"));
const ProfileSetup = lazy(() => import("@/pages/profile-setup"));
const Settings = lazy(() => import("@/pages/settings"));
const Vendors = lazy(() => import("@/pages/vendors"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);


function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={user ? Home : Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/logged-out" component={LoggedOut} />
        <Route path="/dashboard" component={user ? Home : Login} />
        <Route path="/profile" component={user ? ProfileSetup : Login} />
        <Route path="/profile-setup" component={user ? ProfileSetup : Login} />
        <Route path="/settings" component={user ? Settings : Login} />
        <Route path="/vendors" component={user ? Vendors : Login} />
        <Route path="/edit-event-type/:id" component={user ? EditEventType : Login} />
        <Route path="/onboarding/:token" component={Onboarding} />
        <Route path="/vendor-onboarding" component={VendorOnboarding} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
