
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
      // Generate a unique random name to prevent constraint violations
      const timestamp = new Date().getTime();
      const randomSuffix = Math.floor(Math.random() * 10000);
      const defaultName = `user_${timestamp}_${randomSuffix}`;
      
      // Start the OAuth flow with metadata
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: mode === 'signup' ? { prompt: 'select_account' } : undefined,
          // Add default profile data
          data: {
            random_name: defaultName
          }
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        console.error('Error signing in with Google:', error.message);
      } else if (!data || !data.url) {
        toast({
          title: "Authentication Error",
          description: "Failed to start authentication process",
          variant: "destructive"
        });
        console.error('Failed to get authentication URL');
      }
      // If successful, the user will be redirected to Google
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
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
