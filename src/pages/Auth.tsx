
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <Layout hideFooter>
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-lavender to-emerald bg-clip-text text-transparent mb-2">
              Welcome to GnL café
            </h1>
            <p className="text-muted-foreground">
              Join our community of thinkers and explorers
            </p>
          </div>

          <div className="space-y-4">
            <CustomButton
              variant="outline"
              className="w-full justify-center"
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </CustomButton>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
