import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  age: number;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileSetupNeeded, setIsProfileSetupNeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkProfile = async () => {
    setIsLoading(true);
    
    // Check if we have a temp user ID in localStorage
    const tempUserId = localStorage.getItem('tempUserId');
    const storedProfile = localStorage.getItem('userProfile');
    
    if (tempUserId && storedProfile) {
      try {
        // Verify the profile exists in the database
        const { data, error } = await supabase
          .from('profiles')
          .select('id, random_name, age')
          .eq('id', tempUserId)
          .single();
        
        if (data && !error) {
          const profileData = {
            id: data.id,
            name: data.random_name || 'Anonymous',
            age: data.age || 0
          };
          setProfile(profileData);
          setIsProfileSetupNeeded(false);
        } else {
          // Profile doesn't exist in DB, clear localStorage and require setup
          localStorage.removeItem('tempUserId');
          localStorage.removeItem('userProfile');
          setIsProfileSetupNeeded(true);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsProfileSetupNeeded(true);
      }
    } else {
      setIsProfileSetupNeeded(true);
    }
    
    setIsLoading(false);
  };

  const completeProfileSetup = (userId: string) => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profileData = JSON.parse(storedProfile);
      setProfile(profileData);
    }
    setIsProfileSetupNeeded(false);
  };

  const clearProfile = () => {
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('userProfile');
    setProfile(null);
    setIsProfileSetupNeeded(true);
  };

  useEffect(() => {
    checkProfile();
  }, []);

  return {
    profile,
    isProfileSetupNeeded,
    isLoading,
    completeProfileSetup,
    clearProfile,
    refreshProfile: checkProfile
  };
};