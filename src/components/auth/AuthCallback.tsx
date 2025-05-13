import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }
        
        if (data.session) {
          // Check if this is a new user by looking at their profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('random_name, about, gender, country, age')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          // Consider a user new if they don't have profile data filled out
          const isNewUser = !profileData || 
                        !profileData.random_name || 
                        profileData.random_name.startsWith('user_') || 
                        !profileData.about || 
                        !profileData.gender ||
                        !profileData.country ||
                        !profileData.age;
          
          if (isNewUser) {
            // Redirect new users to profile with edit mode
            window.location.href = `/profile?edit=true`;
          } else {
            // Existing users go to regular profile
            window.location.href = '/profile';
          }
        } else {
          window.location.href = '/auth'; // Redirect to auth page if no session
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    handleAuthCallback();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
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

export default AuthCallback;
