
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
  return (
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
  );
};
