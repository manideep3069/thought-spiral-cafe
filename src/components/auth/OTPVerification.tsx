
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from '@/components/ui/label';
import { CustomButton } from '@/components/ui/custom-button';

interface OTPVerificationProps {
  email: string;
  onVerificationComplete: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerificationComplete
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Email verified successfully",
        });
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter verification code</Label>
        <p className="text-sm text-muted-foreground">
          We've sent a code to {email}
        </p>
        <InputOTP
          value={otp}
          onChange={(value) => setOtp(value)}
          maxLength={6}
          render={({ slots }) => (
            <InputOTPGroup className="gap-2">
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      <CustomButton
        onClick={handleVerify}
        className="w-full"
        isLoading={isLoading}
      >
        Verify Email
      </CustomButton>
    </div>
  );
};
