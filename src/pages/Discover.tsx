
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockPosts } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Discover = () => {
  const popularTags = ['philosophy', 'art', 'science', 'poetry', 'books', 'music', 'history', 'nature'];
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4">Discover Thoughts</h1>
          <div className="relative">
            <Input 
              placeholder="Search thoughts..." 
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <Tag 
                key={tag}
                text={tag}
                className="capitalize"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {mockPosts.map(post => (
            <PostCard 
              key={post.id}
              post={post}
              compact
              onViewThread={(id) => console.log('View thread:', id)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
