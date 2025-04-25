
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
  email?: string;
  phone?: string;
  onVerificationComplete: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  phone,
  onVerificationComplete
}) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: phone ? 'sms' : 'email',
        email: email,
      });

      if (error) {
        toast({
          title: "Hmm… that code's already wandered off.",
          description: "Try again. Or ask the café nicely.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: phone ? "Phone verified successfully" : "Email verified successfully",
        });
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
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
          {phone ? "Let the café find your number..." : `We've sent a code to ${email}`}
        </p>
        <InputOTP
          value={otp}
          onChange={(value) => setOtp(value)}
          maxLength={6}
          render={({ slots }) => (
            <InputOTPGroup className="gap-2">
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
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
        {isLoading ? "Verifying..." : "Verify Code"}
      </CustomButton>
    </div>
  );
};
