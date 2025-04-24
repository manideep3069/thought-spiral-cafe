import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockUsers, mockPosts } from '@/data/mockData';
import { CustomButton } from '@/components/ui/custom-button';
import { Edit, MapPin, Calendar, Heart, Save, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/avatar-placeholder';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'thoughts' | 'about'>('thoughts');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Form fields
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  
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
        .single();
      
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
          setIsEditMode(true);
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
        
        // Enable edit mode if viewing own profile and fields are empty
        if (currentUser && currentUser.id === id && (!profileData.random_name || !profileData.about)) {
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
        description: "Your profile has been successfully updated",
      });
      
      // Exit edit mode
      setIsEditMode(false);
      
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
  
  // If no profile data is loaded yet, show loading state
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
  
  // If profile doesn't exist
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <div className="relative mb-8">
          {/* Profile banner */}
          <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-lavender/30 to-emerald/30 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529697216570-d448c2f11e40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30"></div>
          </div>
          
          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-6 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end">
            {!isEditMode ? (
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-lavender/20 border-4 border-background flex items-center justify-center overflow-hidden">
                {userProfile.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={name || userProfile.random_name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarPlaceholder 
                    name={name || userProfile.random_name || 'User'} 
                    size="lg" 
                  />
                )}
              </div>
            ) : (
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-lavender/20 border-4 border-background flex items-center justify-center overflow-hidden">
                <AvatarPlaceholder 
                  name={name || 'User'} 
                  size="lg" 
                />
              </div>
            )}
            
            <div className="mt-4 sm:mt-0 sm:ml-4 pb-4 text-center sm:text-left">
              {!isEditMode ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold">
                    {userProfile.random_name || 'Anonymous User'}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                    {userProfile.country && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {userProfile.country}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {format(new Date(userProfile.created_at || new Date()), "MMMM yyyy")}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full sm:w-64">
                  <Input 
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-serif font-bold text-lg"
                  />
                </div>
              )}
            </div>
            
            {currentUser && currentUser.id === (userId || currentUser.id) && (
              <div className="ml-auto mt-4 sm:mt-0 pb-4">
                {!isEditMode ? (
                  <CustomButton variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </CustomButton>
                ) : (
                  <CustomButton 
                    variant="accent" 
                    size="sm" 
                    onClick={handleSaveProfile}
                    isLoading={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </CustomButton>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Profile content (with extra margin to clear the avatar) */}
        <div className="mt-20 sm:mt-24 relative pb-20">
          {/* Tags */}
          {userProfile.tags && userProfile.tags.length > 0 && !isEditMode && (
            <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
              {userProfile.tags.map((tag: string) => (
                <Tag key={tag} text={tag} color="primary" className="capitalize" />
              ))}
            </div>
          )}
          
          {!isEditMode ? (
            <>
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
                <div className="space-y-6">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <PostCard key={post.id} post={post} compact />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-foreground mb-2">No thoughts shared yet</p>
                      <p className="text-muted-foreground">
                        When {userProfile.random_name || 'this user'} shares thoughts, they'll appear here.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-medium mb-4">About {userProfile.random_name || 'this user'}</h3>
                  
                  {userProfile.about ? (
                    <p className="text-foreground whitespace-pre-line">{userProfile.about}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio provided yet.</p>
                  )}
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userProfile.age && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                        <p>{userProfile.age}</p>
                      </div>
                    )}
                    {userProfile.gender && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
                        <p>{userProfile.gender}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Edit profile form
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-medium mb-4">Edit Your Profile</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input 
                      placeholder="Your country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Age</label>
                      <Input 
                        type="number"
                        placeholder="Your age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gender</label>
                      <Input 
                        placeholder="Your gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">About you</label>
                  <Textarea 
                    placeholder="Tell us about yourself..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <CustomButton 
                  variant="outline" 
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </CustomButton>
                <CustomButton 
                  onClick={handleSaveProfile}
                  isLoading={isSubmitting}
                >
                  Save Profile
                </CustomButton>
              </div>
            </div>
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
