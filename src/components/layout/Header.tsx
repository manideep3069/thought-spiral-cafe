
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { NewThoughtModal } from "@/components/post/NewThoughtModal";
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { AuthButtons } from './AuthButtons';
import { MobileMenu } from './MobileMenu';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isNewThoughtModalOpen, setIsNewThoughtModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Apply dark mode setting on component mount and when changed
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

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
    setIsDarkMode(!isDarkMode);
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
          <Link to="/" className="flex flex-col items-center mr-6">
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-lavender to-emerald bg-clip-text text-transparent">
              GnL
            </span>
            <span className="font-serif text-muted-foreground text-xs -mt-1">café</span>
          </Link>
          
          {!isMobile && <Navigation />}
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
              <SearchBar />
              <AuthButtons 
                user={user}
                onNewThought={handleNewThought}
                onSignIn={handleSignIn}
              />
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
      
      <MobileMenu 
        isOpen={isMobile && isMenuOpen}
        user={user}
        onClose={() => setIsMenuOpen(false)}
        onNewThought={handleNewThought}
        onSignIn={handleSignIn}
      />
      
      <NewThoughtModal 
        isOpen={isNewThoughtModalOpen}
        onClose={() => setIsNewThoughtModalOpen(false)}
      />
    </header>
  );
};
