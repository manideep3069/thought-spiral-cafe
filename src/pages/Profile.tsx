
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockUsers, mockPosts } from '@/data/mockData';
import { CustomButton } from '@/components/ui/custom-button';
import { Edit, MapPin, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'thoughts' | 'about'>('thoughts');
  
  // Default to first user if no ID provided
  const user = userId 
    ? mockUsers.find(u => u.id === userId) 
    : mockUsers[0];
  
  const userPosts = mockPosts.filter(post => post.authorId === user?.id);
  
  if (!user) {
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
        <div className="relative mb-8">
          {/* Profile banner */}
          <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-lavender/30 to-emerald/30 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529697216570-d448c2f11e40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30"></div>
          </div>
          
          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-6 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-lavender/20 border-4 border-background flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lavender text-4xl font-semibold">
                  {user.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-4 pb-4 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold">{user.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                {user.country && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.country}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                </div>
              </div>
            </div>
            
            <div className="ml-auto mt-4 sm:mt-0 pb-4">
              <CustomButton variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </CustomButton>
            </div>
          </div>
        </div>
        
        {/* Profile content (with extra margin to clear the avatar) */}
        <div className="mt-20 sm:mt-24">
          {/* Tags */}
          {user.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
              {user.tags.map(tag => (
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
            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} compact />
                ))
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-2xl">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground mb-2">No thoughts shared yet</p>
                  <p className="text-muted-foreground">
                    When {user.name} shares thoughts, they'll appear here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4">About {user.name}</h3>
              
              {user.about ? (
                <p className="text-foreground whitespace-pre-line">{user.about}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio provided yet.</p>
              )}
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.age && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                    <p>{user.age}</p>
                  </div>
                )}
                {user.gender && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
                    <p>{user.gender}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
