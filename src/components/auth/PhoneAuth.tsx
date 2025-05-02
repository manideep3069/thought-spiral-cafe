
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/custom-button';
import { countryCodes } from '@/lib/countryCodes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneAuthProps {
  isSignUp: boolean;
  onShowOTP: (phone: string) => void;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ isSignUp, onShowOTP }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Phone authentication
      const fullPhone = `${countryCode}${phone}`;
      console.log('Attempting phone verification:', { 
        phone: fullPhone, 
        isSignUp, 
        shouldCreateUser: isSignUp 
      });
      
      const { error, data } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          shouldCreateUser: isSignUp,
        }
      });

      console.log('Phone OTP response:', { error, data });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        onShowOTP(fullPhone);
        toast({
          title: "Secret Code Sent",
          description: "Check your phone for the verification code",
        });
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
        <Label htmlFor="phone">Phone Number</Label>
        <div className="flex gap-2">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {countryCodes.map((code) => (
                <SelectItem key={code.dial_code} value={code.dial_code}>
                  {code.flag} {code.dial_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  );
};
