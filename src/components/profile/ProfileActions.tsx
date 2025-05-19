
import React from 'react';
import { LogOut } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileActionsProps {
  isOwnProfile: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({ isOwnProfile }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out"
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Unexpected sign-out error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while signing out",
        variant: "destructive"
      });
    }
  };

  if (!isOwnProfile) return null;

  return (
    <div className="absolute bottom-0 right-0 mb-4">
      <CustomButton 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </CustomButton>
    </div>
  );
};
