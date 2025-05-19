
import React from 'react';
import { PostCard } from '@/components/post/PostCard';
import { Heart } from 'lucide-react';

interface ProfileThoughtsProps {
  userProfile: any;
  userPosts: any[];
}

export const ProfileThoughts: React.FC<ProfileThoughtsProps> = ({ 
  userProfile,
  userPosts
}) => {
  // Ensure we have userProfile before trying to access properties
  // Default to 'this user' if name is not available
  const displayName = userProfile?.random_name || userProfile?.name || 'this user';
  
  return (
    <div className="space-y-6">
      {/* Check if userPosts is available and has items */}
      {Array.isArray(userPosts) && userPosts.length > 0 ? (
        userPosts.map((post) => (
          <PostCard key={post.id} post={post} compact />
        ))
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-2xl">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">No thoughts shared yet</p>
          <p className="text-muted-foreground">
            When {displayName} shares thoughts, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
};
