import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/custom-button';
import { Home, Search, Bell, User, Menu, X, Moon, Sun, LogIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { NewThoughtModal } from "@/components/post/NewThoughtModal";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isNewThoughtModalOpen, setIsNewThoughtModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNewThought = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsNewThoughtModalOpen(true);
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-lavender to-emerald bg-clip-text text-transparent">
              GnL
            </span>
            <span className="ml-1 font-serif text-muted-foreground">{" "}café</span>
          </Link>
          
          {!isMobile && (
            <nav className="hidden md:flex space-x-6 ml-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              <Link to="/discover" className="text-foreground hover:text-primary transition-colors flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Discover
              </Link>
              <Link to="/notifications" className="text-foreground hover:text-primary transition-colors flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          {!isMobile ? (
            <>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-32 md:w-48 h-9 px-3 rounded-full bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              {user ? (
                <>
                  <Link to="/profile">
                    <div className="h-9 w-9 rounded-full bg-lavender/20 flex items-center justify-center overflow-hidden">
                      <User className="h-5 w-5 text-lavender" />
                    </div>
                  </Link>
                  
                  <CustomButton variant="accent" size="sm" onClick={handleNewThought}>
                    New Thought
                  </CustomButton>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <CustomButton variant="outline" size="sm" onClick={handleSignIn}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </CustomButton>
                  <CustomButton variant="accent" size="sm" onClick={handleSignIn}>
                    Sign Up
                  </CustomButton>
                </div>
              )}
            </>
          ) : (
            <button 
              onClick={toggleMenu} 
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background border-t border-border animate-in slide-in-from-top-5">
          <div className="container py-6 space-y-4">
            <Link 
              to="/" 
              className="flex items-center p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
            <Link 
              to="/discover" 
              className="flex items-center p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-5 w-5 mr-3" />
              <span>Discover</span>
            </Link>
            <Link 
              to="/notifications" 
              className="flex items-center p-3 rounded-lg hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell className="h-5 w-5 mr-3" />
              <span>Notifications</span>
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center p-3 rounded-lg hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Profile</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-border">
                  <CustomButton 
                    variant="accent" 
                    className="w-full justify-center"
                    onClick={() => {
                      handleNewThought();
                      setIsMenuOpen(false);
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
                    handleSignIn();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign In
                </CustomButton>
                <CustomButton 
                  variant="accent"
                  className="w-full justify-center"
                  onClick={() => {
                    handleSignIn();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      )}
      
      <NewThoughtModal 
        isOpen={isNewThoughtModalOpen}
        onClose={() => setIsNewThoughtModalOpen(false)}
      />
    </header>
  );
};
