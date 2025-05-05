
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

const queryClient = new QueryClient();

// Ground Rules wrapper for routes
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
          .single();
        
        if (profile) {
          setHasAcceptedRules(profile.rules_accepted);
          // Show rules modal if user hasn't accepted yet
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
            .single();
            
          if (profile) {
            setHasAcceptedRules(profile.rules_accepted);
            setShowRulesModal(!profile.rules_accepted);
          } else {
            setShowRulesModal(true);
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Listen for changes to the profile data to update rule acceptance status
    if (user) {
      const profiles = supabase
        .channel('public:profiles')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          if (payload.new && 'rules_accepted' in payload.new) {
            setHasAcceptedRules(payload.new.rules_accepted as boolean);
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(profiles);
      };
    }
  }, [user]);
  
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
  // and a minimal container (not the full app layout)
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

// Auth callback handler
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else if (data.session) {
          // Redirect to profile page after successful authentication
          window.location.href = '/profile';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
      }
    };
    
    handleAuthCallback();
  }, []);
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <a href="/auth" className="mt-4 inline-block text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
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
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/thread/:postId" element={<ProtectedRoute><ThreadView /></ProtectedRoute>} />
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
