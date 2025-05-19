
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  hasAcceptedRules: boolean;
  setHasAcceptedRules: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  hasAcceptedRules: false,
  setHasAcceptedRules: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check rules acceptance if there's a user
        if (currentSession?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('rules_accepted')
            .eq('id', currentSession.user.id)
            .maybeSingle();
            
          setHasAcceptedRules(!!profile?.rules_accepted);
        } else {
          setHasAcceptedRules(false);
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Check rules acceptance if there's a user
        if (initialSession?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('rules_accepted')
            .eq('id', initialSession.user.id)
            .maybeSingle();
            
          setHasAcceptedRules(!!profile?.rules_accepted);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const value = {
    session,
    user,
    isLoading,
    hasAcceptedRules,
    setHasAcceptedRules,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
