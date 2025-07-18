
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useProfile } from '@/hooks/useProfile';

interface AuthButtonsProps {
  user: SupabaseUser | null;
  onNewThought: () => void;
  onSignIn: () => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  user,
  onNewThought,
  onSignIn,
}) => {
  const { profile, isProfileSetupNeeded } = useProfile();
  const navigate = useNavigate();

  // Show profile and new thought button if we have a temporary profile
  if (profile && !isProfileSetupNeeded) {
    return (
      <>
        <Link to="/profile">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-medium text-primary">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </Link>
        
        <CustomButton variant="accent" size="sm" onClick={onNewThought}>
          New Thought
        </CustomButton>
      </>
    );
  }

  // Show new thought button if profile setup is needed (will trigger setup)
  if (isProfileSetupNeeded) {
    return (
      <CustomButton variant="accent" size="sm" onClick={onNewThought}>
        New Thought
      </CustomButton>
    );
  }

  // Fallback - shouldn't normally reach here
  return (
    <CustomButton variant="accent" size="sm" onClick={onNewThought}>
      New Thought
    </CustomButton>
  );
};
