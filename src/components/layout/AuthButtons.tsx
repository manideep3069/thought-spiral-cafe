
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
  if (user) {
    return (
      <>
        <Link to="/profile">
          <div className="h-9 w-9 rounded-full bg-lavender/20 flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-lavender" />
          </div>
        </Link>
        
        <CustomButton variant="accent" size="sm" onClick={onNewThought}>
          New Thought
        </CustomButton>
      </>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <CustomButton variant="outline" size="sm" onClick={onSignIn}>
        <LogIn className="h-4 w-4 mr-2" />
        Sign In
      </CustomButton>
      <CustomButton variant="accent" size="sm" onClick={onSignIn}>
        Sign Up
      </CustomButton>
    </div>
  );
};
