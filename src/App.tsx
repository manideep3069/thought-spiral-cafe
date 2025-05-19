
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ThreadView from "./pages/ThreadView";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import NotificationsPage from "./pages/Notifications";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { GroundRulesModal } from "./components/auth/GroundRulesModal";
import AuthCallback from "./components/auth/AuthCallback";

const queryClient = new QueryClient();

// Ground Rules wrapper for routes that require authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  
  useEffect(() => {
    // Get current session and user
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      setUser(currentUser || null);
      
      if (currentUser) {
        // Check if user has accepted the rules
        const { data: profile } = await supabase
          .from('profiles')
          .select('rules_accepted')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (profile) {
          setHasAcceptedRules(profile.rules_accepted);
          // Only show rules modal for new users who haven't accepted the rules yet
          setShowRulesModal(!profile.rules_accepted);
        }
      }
      
      setLoading(false);
    };
    
    getSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setUser(currentUser || null);
        
        if (currentUser) {
          // Check rules acceptance on auth change
          const { data: profile } = await supabase
            .from('profiles')
            .select('rules_accepted')
            .eq('id', currentUser.id)
            .maybeSingle();
            
          if (profile) {
            setHasAcceptedRules(profile.rules_accepted);
            // Only show rules modal for users who haven't accepted the rules
            setShowRulesModal(!profile.rules_accepted);
          } else {
            // If profile doesn't exist, we'll need to show the rules
            setShowRulesModal(true);
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If user hasn't accepted rules, show only the rules modal
  if (user && !hasAcceptedRules) {
    return (
      <>
        {children}
        <GroundRulesModal 
          open={showRulesModal} 
          onOpenChange={setShowRulesModal} 
        />
      </>
    );
  }
  
  // User exists and has accepted rules
  return children;
};

// Public route wrapper with optional auth state
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Public routes that anyone can view */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/discover" element={<PublicRoute><Discover /></PublicRoute>} />
          <Route path="/thread/:postId" element={<PublicRoute><ThreadView /></PublicRoute>} />
          {/* Protected routes that require authentication */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
