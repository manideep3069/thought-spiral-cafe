import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        console.log("Auth callback started, processing OAuth response");
        
        // Check if there are error parameters in the URL
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get('error');
        const errorDescriptionParam = url.searchParams.get('error_description');
        
        if (errorParam) {
          console.error("Auth error from URL parameters:", errorParam, errorDescriptionParam);
          setError(errorDescriptionParam || errorParam);
          toast({
            title: "Authentication Error",
            description: errorDescriptionParam || "An error occurred during sign in",
            variant: "destructive"
          });
          // Redirect to auth page after error
          setTimeout(() => {
            window.location.href = '/auth';
          }, 3000);
          return;
        }
        
        // Add retry logic for connection issues
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            // Process the OAuth callback
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              if (error.message.includes('upstream connect error') && retryCount < maxRetries - 1) {
                console.log(`Connection error, retrying... (${retryCount + 1}/${maxRetries})`);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
                continue;
              }
              throw error;
            }
            
            console.log("Session retrieved:", data.session ? "Valid session" : "No session");
            
            if (data.session) {
              // Check if this is a new user by looking at their profile
              try {
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('random_name, about, rules_accepted')
                  .eq('id', data.session.user.id)
                  .maybeSingle();
                
                if (profileError && !profileError.message.includes('upstream connect error')) {
                  console.error("Error fetching profile:", profileError);
                }
                
                console.log("Profile data:", profileData);
                
                // Consider a user new if they don't have profile data filled out
                // or if their rules_accepted is false
                const isNewUser = !profileData || 
                              !profileData.rules_accepted || 
                              !profileData.about || 
                              (profileData.random_name && profileData.random_name.startsWith('user_'));
                
                console.log("Is new user:", isNewUser);
                
                if (isNewUser) {
                  // Redirect new users to profile with edit mode
                  toast({
                    title: "Welcome to GnL Café",
                    description: "Please complete your profile",
                  });
                  window.location.href = `/profile?edit=true`;
                } else {
                  // Existing users go to regular profile
                  toast({
                    title: "Welcome back",
                    description: "You've successfully signed in",
                  });
                  window.location.href = '/profile';
                }
              } catch (profileError) {
                console.error("Error checking profile:", profileError);
                // If profile check fails, still redirect to profile edit
                window.location.href = `/profile?edit=true`;
              }
            } else {
              console.log("No session found, redirecting to auth page");
              toast({
                title: "Authentication Failed",
                description: "Please try signing in again",
                variant: "destructive"
              });
              window.location.href = '/auth';
            }
            break; // Success, exit retry loop
          } catch (retryError: any) {
            console.error(`Attempt ${retryCount + 1} failed:`, retryError);
            if (retryCount === maxRetries - 1) {
              throw retryError; // Last attempt failed, throw error
            }
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } catch (err: any) {
        console.error("Unhandled auth callback error:", err);
        const errorMessage = err?.message?.includes('upstream connect error') 
          ? "Connection error. Please check your internet connection and try again."
          : err?.message || "An unexpected error occurred";
        
        setError(errorMessage);
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Redirect to auth page after error
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthCallback();
  }, [toast]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
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

export default AuthCallback;
