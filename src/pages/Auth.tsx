
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailAuth } from '@/components/auth/EmailAuth';
import { PhoneAuth } from '@/components/auth/PhoneAuth';
import { SocialAuth } from '@/components/auth/SocialAuth';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
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

  const handleVerificationComplete = () => {
    navigate('/');
  };

  const handleShowEmailOTP = (email: string) => {
    setVerificationEmail(email);
    setShowOTP(true);
  };

  const handleShowPhoneOTP = (phone: string) => {
    setVerificationPhone(phone);
    setShowOTP(true);
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
              {isSignUp ? "Welcome, Stranger. The café has been expecting you." : "Welcome back, Wanderer"}
            </p>
          </div>

          {showOTP ? (
            <OTPVerification
              email={verificationEmail}
              phone={verificationPhone}
              onVerificationComplete={handleVerificationComplete}
              isSignUp={isSignUp}
            />
          ) : (
            <>
              <Tabs defaultValue="email" className="mb-6" onValueChange={(value) => setAuthMethod(value as 'email' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  <EmailAuth 
                    isSignUp={isSignUp}
                    onShowOTP={handleShowEmailOTP}
                  />
                </TabsContent>
                <TabsContent value="phone">
                  <PhoneAuth 
                    isSignUp={isSignUp}
                    onShowOTP={handleShowPhoneOTP}
                  />
                </TabsContent>
              </Tabs>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <SocialAuth />
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
