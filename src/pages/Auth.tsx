
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

  // Google Sign In (existing users)
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
      // Successful redirect handled by Supabase
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

  // Google Sign Up (new users) - uses same endpoint as signIn, but label distinguishes intent
  const handleGoogleSignUp = async () => {
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
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
        console.error('Sign up error with Google:', error.message);
      }
    } catch (error) {
      console.error('Error during Google sign-up:', error);
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;

      if (isSignUp) {
        // Sign up with email
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        // Sign in with email
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive"
        });
        console.error('Auth error:', result.error.message);
      } else {
        if (isSignUp && result.data?.user && !result.data.session) {
          toast({
            title: "Verification email sent",
            description: "Please check your email to confirm your account",
          });
        } else if (result.data?.session) {
          // If it's a new signup, redirect to profile edit page
          if (isSignUp) {
            navigate('/profile');
          } else {
            // For regular login, go to homepage
            navigate('/');
          }
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <CustomButton 
              type="submit" 
              className="w-full justify-center" 
              isLoading={isLoading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CustomButton>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Sign in with Google */}
            <CustomButton
              variant="outline"
              className="w-full justify-center"
              onClick={handleGoogleSignIn}
              isLoading={googleLoading}
              disabled={googleLoading}
            >
              <span className="mr-2">Sign in with Google</span>
            </CustomButton>
            {/* Sign up with Google */}
            <CustomButton
              variant="accent"
              className="w-full justify-center"
              onClick={handleGoogleSignUp}
              isLoading={googleLoading}
              disabled={googleLoading}
            >
              <span className="mr-2">Sign up with Google</span>
            </CustomButton>
            <div className="text-center text-sm">
              <button 
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : 'Don\'t have an account? Sign Up'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
