import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

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
      if (authMethod === 'email') {
        let result;
        if (isSignUp) {
          result = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (result.error) {
            toast({
              title: "Sign Up Error",
              description: result.error.message,
              variant: "destructive"
            });
          } else {
            setVerificationEmail(email);
            setShowOTP(true);
            toast({
              title: "Your spiral begins here.",
              description: "Please check your email for the verification code",
            });
          }
        } else {
          result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (result.error) {
            toast({
              title: "Sign In Error",
              description: result.error.message,
              variant: "destructive"
            });
          } else if (result.data.session) {
            toast({
              title: "Welcome back, Wanderer.",
              description: "You've successfully signed in",
            });
            navigate('/');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.startsWith('+') ? phone : `+${phone}`,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setVerificationPhone(phone);
          setShowOTP(true);
          toast({
            title: "Secret Code Sent",
            description: "Check your phone for the verification code",
          });
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

  const handleVerificationComplete = () => {
    navigate('/');
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
              {isSignUp ? "Your spiral begins here." : "Welcome back, Wanderer"}
            </p>
          </div>

          {showOTP ? (
            <OTPVerification
              email={verificationEmail}
              phone={verificationPhone}
              onVerificationComplete={handleVerificationComplete}
            />
          ) : (
            <>
              <Tabs defaultValue="email" className="mb-6" onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
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
                </TabsContent>
                <TabsContent value="phone">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="tel" 
                          placeholder="+91" 
                          className="w-20"
                          value="+91"
                          readOnly
                        />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <CustomButton 
                      type="submit" 
                      className="w-full justify-center" 
                      isLoading={isLoading}
                    >
                      Get Secret Code 🔐
                    </CustomButton>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <CustomButton
                  variant="outline"
                  className="w-full justify-center"
                  onClick={handleGoogleSignIn}
                  isLoading={googleLoading}
                  disabled={googleLoading}
                >
                  <span className="mr-2">Sign in with Google</span>
                </CustomButton>
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
                      ? 'Already wandered in? Sign In' 
                      : 'First time here? Sign Up'}
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
