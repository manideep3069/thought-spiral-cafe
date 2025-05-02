
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomButton } from '@/components/ui/custom-button';
import { useToast } from '@/hooks/use-toast';

export const SocialAuth: React.FC = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        console.error('Error signing in with Google:', error.message);
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred",
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
