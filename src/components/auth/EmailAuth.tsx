
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
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (result.error) {
          toast({
            title: "Sign Up Error",
            description: result.error.message,
            variant: "destructive"
          });
        } else {
          onShowOTP(email);
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
