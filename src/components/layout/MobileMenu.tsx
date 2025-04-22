
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
    <div className="fixed inset-0 top-16 z-50 bg-background border-t border-border animate-in slide-in-from-top-5">
      <div className="container py-6 space-y-4">
        <Link 
          to="/" 
          className="flex items-center p-3 rounded-lg hover:bg-muted"
          onClick={onClose}
        >
          <Home className="h-5 w-5 mr-3" />
          <span>Home</span>
        </Link>
        <Link 
          to="/discover" 
          className="flex items-center p-3 rounded-lg hover:bg-muted"
          onClick={onClose}
        >
          <Search className="h-5 w-5 mr-3" />
          <span>Discover</span>
        </Link>
        <Link 
          to="/notifications" 
          className="flex items-center p-3 rounded-lg hover:bg-muted"
          onClick={onClose}
        >
          <Bell className="h-5 w-5 mr-3" />
          <span>Notifications</span>
        </Link>
        
        {user ? (
          <>
            <Link 
              to="/profile" 
              className="flex items-center p-3 rounded-lg hover:bg-muted"
              onClick={onClose}
            >
              <User className="h-5 w-5 mr-3" />
              <span>Profile</span>
            </Link>
            <div className="pt-4 mt-4 border-t border-border">
              <CustomButton 
                variant="accent" 
                className="w-full justify-center"
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
          <div className="pt-4 mt-4 border-t border-border space-y-2">
            <CustomButton 
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                onSignIn();
                onClose();
              }}
            >
              Sign In
            </CustomButton>
            <CustomButton 
              variant="accent"
              className="w-full justify-center"
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
