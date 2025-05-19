
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { mockUsers, mockPosts } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getQuoteOfTheDay } from '@/utils/quoteUtils';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileThoughts } from '@/components/profile/ProfileThoughts';
import { ProfileTags } from '@/components/profile/ProfileTags';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { useAuth } from '@/components/auth/AuthProvider';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const shouldEdit = searchParams.get('edit') === 'true';
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'thoughts' | 'about'>('thoughts');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author: string }>({ text: '', author: '' });

  // Form fields
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  
  // Get daily quote
  useEffect(() => {
    const quote = getQuoteOfTheDay();
    setDailyQuote(quote);
  }, []);
  
  useEffect(() => {
    const profileId = userId || currentUser?.id;
    
    if (!profileId) {
      if (!userId) {
        // Not logged in and no profile requested, redirect to login
        navigate('/auth');
      }
      return;
    }
    
    loadUserProfile(profileId);
  }, [userId, currentUser, navigate]);
  
  const loadUserProfile = async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading profile for user:", id);
      // First try to get from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      if (!profileData) {
        console.log("No profile found, using mock data");
        // Fallback to mock data
        const mockUser = mockUsers.find(u => u.id === id) || mockUsers[0];
        setUserProfile(mockUser);
        
        // Initialize form fields with mock data
        setName(mockUser.name || '');
        setAbout(mockUser.about || '');
        setAge(mockUser.age?.toString() || '');
        setGender(mockUser.gender || '');
        setCountry(mockUser.country || '');
        
        const userMockPosts = mockPosts.filter(post => post.authorId === mockUser.id);
        setUserPosts(userMockPosts);
      } else {
        console.log("Profile found:", profileData);
        // Use Supabase data
        setUserProfile(profileData);
        
        // Initialize form fields with profile data
        setName(profileData.random_name || '');
        setAbout(profileData.about || '');
        setAge(profileData.age?.toString() || '');
        setGender(profileData.gender || '');
        setCountry(profileData.country || '');
        
        // Enable edit mode if viewing own profile and fields are empty or if edit mode is requested via URL
        const isOwnProfile = currentUser && currentUser.id === id;
        const shouldBeInEditMode = shouldEdit || 
          (isOwnProfile && (!profileData.random_name || !profileData.about));
          
        setIsEditMode(shouldBeInEditMode);
        
        try {
          // Get posts from Supabase
          const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });
            
          if (postsError) {
            console.error("Error fetching posts:", postsError);
            throw postsError;
          }
            
          setUserPosts(posts || []);
        } catch (postsError) {
          console.error("Error loading posts:", postsError);
          toast({
            title: "Error",
            description: "Failed to load posts",
            variant: "destructive",
          });
          setUserPosts([]);
        }
      }
    } catch (error) {
      console.error("Error in profile loading:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          random_name: name,
          about,
          age: age ? parseInt(age) : null,
          gender,
          country,
          updated_at: new Date().toISOString(),
          rules_accepted: true, // Mark rules as accepted when profile is saved
        }, { onConflict: 'id' });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your intellectual journey has been documented",
      });
      
      // Exit edit mode
      setIsEditMode(false);
      
      // Clear the edit parameter from URL
      if (shouldEdit) {
        navigate('/profile', { replace: true });
      }
      
      // Refresh profile data
      loadUserProfile(currentUser.id);
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwnProfile = currentUser && currentUser.id === (userId || currentUser.id);

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-pulse h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
          <div className="animate-pulse h-6 w-72 bg-muted rounded mx-auto"></div>
        </div>
      </Layout>
    );
  }
  
  // Not found state
  if (!userProfile && userId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-medium mb-4">User Not Found</h2>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <ProfileHeader 
          userProfile={userProfile}
          currentUser={currentUser}
          isEditMode={isEditMode}
          name={name}
          setName={setName}
          isSubmitting={isSubmitting}
          onEdit={() => setIsEditMode(true)}
          onSave={handleSaveProfile}
        />
        
        {/* Profile content (with extra margin to clear the avatar) */}
        <div className="mt-20 sm:mt-24 relative pb-20">
          {isEditMode ? (
            <ProfileEditForm 
              about={about}
              setAbout={setAbout}
              age={age}
              setAge={setAge}
              gender={gender}
              setGender={setGender}
              country={country}
              setCountry={setCountry}
              dailyQuote={dailyQuote}
              onCancel={() => setIsEditMode(false)}
              onSave={handleSaveProfile}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <ProfileTags tags={userProfile.tags} />
              
              <ProfileTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                postsCount={userPosts.length}
              />
              
              {/* Tab content */}
              {activeTab === 'thoughts' ? (
                <ProfileThoughts userProfile={userProfile} userPosts={userPosts} />
              ) : (
                <ProfileAbout userProfile={userProfile} />
              )}
            </>
          )}
          
          {/* Sign Out Button - Positioned at bottom right */}
          <ProfileActions isOwnProfile={isOwnProfile} />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
