
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tag } from '@/components/ui/tag';
import { mockUsers, mockPosts } from '@/data/mockData';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/custom-button';
import { getQuoteOfTheDay } from '@/utils/quoteUtils';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileThoughts } from '@/components/profile/ProfileThoughts';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const shouldEdit = searchParams.get('edit') === 'true';
  const [activeTab, setActiveTab] = useState<'thoughts' | 'about'>('thoughts');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  
  // Check if current user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // If no userId is provided in URL, use current user's ID
        loadUserProfile(userId || session.user.id);
      } else if (!userId) {
        // Not logged in and no profile requested, redirect to login
        navigate('/auth');
      } else {
        // Not logged in but viewing someone's profile
        loadUserProfile(userId);
      }
    };
    
    checkAuth();
  }, [userId, navigate]);
  
  const loadUserProfile = async (id: string) => {
    try {
      // First try to get from Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        
        // Fallback to mock data
        const mockUser = mockUsers.find(u => u.id === id) || mockUsers[0];
        setUserProfile(mockUser);
        
        // Initialize form fields with mock data
        setName(mockUser.name || '');
        setAbout(mockUser.about || '');
        setAge(mockUser.age?.toString() || '');
        setGender(mockUser.gender || '');
        setCountry(mockUser.country || '');
        
        // Enable edit mode if viewing own profile and just signed up
        if (currentUser && currentUser.id === id) {
          // Check if user just signed up (we'll assume yes for now)
          setIsEditMode(shouldEdit || true);
        }
        
        const userMockPosts = mockPosts.filter(post => post.authorId === mockUser.id);
        setUserPosts(userMockPosts);
        
      } else {
        // Use Supabase data
        setUserProfile(profileData);
        
        // Initialize form fields with profile data
        setName(profileData.random_name || '');
        setAbout(profileData.about || '');
        setAge(profileData.age?.toString() || '');
        setGender(profileData.gender || '');
        setCountry(profileData.country || '');
        
        // Enable edit mode if viewing own profile and fields are empty or if edit mode is requested via URL
        if (currentUser && currentUser.id === id && (shouldEdit || !profileData.random_name || !profileData.about)) {
          setIsEditMode(true);
        }
        
        // Get posts from Supabase
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false });
          
        if (posts) {
          setUserPosts(posts);
        }
      }
    } catch (error) {
      console.error("Error in profile loading:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
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
  
  // Loading state
  if (!userProfile && !userId) {
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
              {/* Tags */}
              {userProfile.tags && userProfile.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {userProfile.tags.map((tag: string) => (
                    <Tag key={tag} text={tag} color="primary" className="capitalize" />
                  ))}
                </div>
              )}
              
              {/* Tabs */}
              <div className="border-b border-border mb-8">
                <div className="flex space-x-8">
                  <button
                    className={`pb-4 font-medium text-sm relative ${
                      activeTab === 'thoughts' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('thoughts')}
                  >
                    Thoughts ({userPosts.length})
                  </button>
                  <button
                    className={`pb-4 font-medium text-sm relative ${
                      activeTab === 'about' 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('about')}
                  >
                    About
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {activeTab === 'thoughts' ? (
                <ProfileThoughts userProfile={userProfile} userPosts={userPosts} />
              ) : (
                <ProfileAbout userProfile={userProfile} />
              )}
            </>
          )}
          
          {/* Sign Out Button - Positioned at bottom right */}
          {currentUser && currentUser.id === (userId || currentUser.id) && (
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
