
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Bell, User } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MobileMenuProps {
  isOpen: boolean;
  user: SupabaseUser | null;
  onClose: () => void;
  onNewThought: () => void;
  onSignIn: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  user,
  onClose,
  onNewThought,
  onSignIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-50 bg-background animate-in slide-in-from-top-5">
      <div className="container py-6 space-y-4">
        <Link 
          to="/" 
          className="flex items-center p-4 rounded-lg bg-card hover:bg-muted text-foreground"
          onClick={onClose}
        >
          <Home className="h-5 w-5 mr-4 shrink-0" />
          <span className="text-base font-medium truncate">Home</span>
        </Link>
        <Link 
          to="/discover" 
          className="flex items-center p-4 rounded-lg bg-card hover:bg-muted text-foreground"
          onClick={onClose}
        >
          <Search className="h-5 w-5 mr-4 shrink-0" />
          <span className="text-base font-medium truncate">Discover</span>
        </Link>
        <Link 
          to="/notifications" 
          className="flex items-center p-4 rounded-lg bg-card hover:bg-muted text-foreground"
          onClick={onClose}
        >
          <Bell className="h-5 w-5 mr-4 shrink-0" />
          <span className="text-base font-medium truncate">Notifications</span>
        </Link>
        
        {user ? (
          <>
            <Link 
              to="/profile" 
              className="flex items-center p-4 rounded-lg bg-card hover:bg-muted text-foreground"
              onClick={onClose}
            >
              <User className="h-5 w-5 mr-4 shrink-0" />
              <span className="text-base font-medium truncate">Profile</span>
            </Link>
            <div className="pt-4 mt-4 border-t border-border">
              <CustomButton 
                variant="accent" 
                className="w-full justify-center py-6"
                onClick={() => {
                  onNewThought();
                  onClose();
                }}
              >
                New Thought
              </CustomButton>
            </div>
          </>
        ) : (
          <div className="pt-4 mt-4 border-t border-border space-y-3">
            <CustomButton 
              variant="outline"
              className="w-full justify-center py-6"
              onClick={() => {
                onSignIn();
                onClose();
              }}
            >
              Sign In
            </CustomButton>
            <CustomButton 
              variant="accent"
              className="w-full justify-center py-6"
              onClick={() => {
                onSignIn();
                onClose();
              }}
            >
              Sign Up
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};
