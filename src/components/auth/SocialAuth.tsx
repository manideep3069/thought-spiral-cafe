
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/custom-button';
import { useToast } from '@/hooks/use-toast';

export const SocialAuth: React.FC<{ mode?: 'signin' | 'signup' }> = ({ mode = 'signin' }) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Use the current origin for redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log(`Starting Google OAuth with redirect to: ${redirectTo}`);
      
      // Setup options for the OAuth flow
      const options: any = {
        redirectTo,
      };
      
      // Force account selection for signup to ensure users get a chance to select the right account
      if (mode === 'signup') {
        options.queryParams = { 
          prompt: 'select_account',
        };
      }
      
      // Generate a truly unique name using UUID to avoid collisions
      const timestamp = new Date().getTime();
      const randomStr = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      const uniqueId = `${timestamp}_${randomStr}`;
      
      // Start the OAuth flow with Google provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          ...options,
          // Add this metadata to be used by the profile creation trigger
          data: {
            random_name: `user_${uniqueId}`
          }
        }
      });

      if (error) {
        console.error('Error initiating Google Auth:', error.message);
        
        // Check for specific error types
        if (error.message.includes('refused to connect') || error.message.includes('X-Frame-Options')) {
          toast({
            title: "OAuth Configuration Error",
            description: "Google OAuth is not properly configured. Please check the redirect URI settings.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (!data || !data.url) {
        console.error('Failed to get authentication URL');
        toast({
          title: "Authentication Error",
          description: "Failed to start authentication process",
          variant: "destructive"
        });
      } else {
        // Log and redirect to the returned OAuth URL
        console.log('Redirecting to Google OAuth URL:', data.url);
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Exception during Google auth:', error);
      toast({
        title: "Authentication Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <CustomButton
        variant="outline"
        className="w-full justify-center"
        onClick={handleGoogleSignIn}
        isLoading={googleLoading}
        disabled={googleLoading}
      >
        <span className="mr-2">Continue with Google</span>
      </CustomButton>
    </div>
  );
};
