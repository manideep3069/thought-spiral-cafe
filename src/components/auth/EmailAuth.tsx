
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/custom-button';
import { useNavigate } from 'react-router-dom';

interface EmailAuthProps {
  isSignUp: boolean;
  onShowOTP: (email: string) => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({ isSignUp, onShowOTP }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        console.log('Attempting email signup:', { email });
        
        // Generate a truly unique random name using UUID and timestamp
        const timestamp = Date.now();
        const randomStr = crypto.randomUUID ? crypto.randomUUID().substring(0, 8) : Math.random().toString(36).substring(2, 10);
        const uniqueId = `${timestamp}_${randomStr}`;
        const defaultName = `user_${uniqueId}`;
        
        // Add retry logic for connection issues
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            result = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  random_name: defaultName
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              }
            });
            break; // Success, exit retry loop
          } catch (retryError: any) {
            if (retryError.message?.includes('upstream connect error') && retryCount < maxRetries - 1) {
              console.log(`Connection error during signup, retrying... (${retryCount + 1}/${maxRetries})`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            throw retryError;
          }
        }
        
        console.log('Sign up result:', result);
        
        if (result?.error) {
          if (result.error.message.includes('upstream connect error')) {
            toast({
              title: "Connection Error",
              description: "Unable to connect to the server. Please check your internet connection and try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign Up Error",
              description: result.error.message,
              variant: "destructive"
            });
          }
        } else if (result?.data.user) {
          if (result.data.session) {
            // User is immediately signed in
            toast({
              title: "Your spiral begins here.",
              description: "Welcome to the café!",
            });
            navigate('/profile?edit=true');
          } else {
            // Email confirmation required
            onShowOTP(email);
            toast({
              title: "Your spiral begins here.",
              description: "Please check your email for the verification code",
            });
          }
        }
      } else {
        // Sign in flow with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            result = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            break; // Success, exit retry loop
          } catch (retryError: any) {
            if (retryError.message?.includes('upstream connect error') && retryCount < maxRetries - 1) {
              console.log(`Connection error during signin, retrying... (${retryCount + 1}/${maxRetries})`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            throw retryError;
          }
        }
        
        console.log('Sign in result:', result);
        
        if (result?.error) {
          if (result.error.message.includes('upstream connect error')) {
            toast({
              title: "Connection Error",
              description: "Unable to connect to the server. Please check your internet connection and try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign In Error",
              description: result.error.message,
              variant: "destructive"
            });
          }
        } else if (result?.data.session) {
          toast({
            title: "Welcome back, Wanderer.",
            description: "You've successfully signed in",
          });
          navigate('/profile');
        }
      }
    } catch (error: any) {
      console.error('Error during authentication:', error);
      const errorMessage = error?.message?.includes('upstream connect error')
        ? "Connection error. Please check your internet connection and try again."
        : error?.message || "An unexpected error occurred";
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
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
        {isSignUp ? "Sign Up" : "Sign In"}
      </CustomButton>
    </form>
  );
};
