
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockPosts } from '@/data/mockData';
import { Filter, TrendingUp } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  const popularTags = ['philosophy', 'art', 'science', 'poetry', 'books', 'music', 'history', 'nature'];
  
  const filteredPosts = activeFilter 
    ? mockPosts.filter(post => post.tags.includes(activeFilter))
    : mockPosts;
  
  const handleViewThread = (postId: string) => {
    navigate(`/thread/${postId}`);
  };
  
  const handleFilterByTag = (tag: string) => {
    setActiveFilter(activeFilter === tag ? null : tag);
    setShowMobileFilter(false); // hide mobile filter on tag select
  };
  
  const quoteOfTheDay = {
    text: "We don't see things as they are, we see them as we are.",
    author: "Anaïs Nin"
  };

  return (
    <Layout>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center">
          {/* Quote of the day */}
          <div className="mb-8 p-6 bg-gradient-to-br from-lavender/10 to-emerald/10 rounded-2xl border border-border shadow-sm w-full max-w-2xl">
            <h2 className="text-xl font-serif font-medium mb-4">Quote of the Day</h2>
            <blockquote className="pl-4 border-l-4 border-lavender italic">
              <p className="text-foreground/80">{quoteOfTheDay.text}</p>
              <footer className="mt-2 text-sm text-muted-foreground">— {quoteOfTheDay.author}</footer>
            </blockquote>
          </div>
          
          {/* Filters for mobile */}
          <div className="mb-6 flex justify-between items-center lg:hidden w-full max-w-2xl">
            <h2 className="text-xl font-serif font-medium">Recent Thoughts</h2>
            <CustomButton 
              variant={showMobileFilter ? "default" : "ghost"} 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowMobileFilter((v) => !v)}
              aria-expanded={showMobileFilter}
              aria-controls="mobile-tag-filter"
            >
              <Filter className="h-4 w-4 mr-1" />
              <span>Filter</span>
            </CustomButton>
          </div>
          {/* Tag filters for mobile, shown if filter button pressed */}
          {showMobileFilter && (
            <div id="mobile-tag-filter" className="mb-4 bg-card border border-border rounded-xl p-4 flex flex-wrap gap-2 w-full max-w-2xl lg:hidden">
              {popularTags.map(tag => (
                <Tag 
                  key={tag} 
                  text={tag}
                  color={activeFilter === tag ? "accent" : "default"}
                  onClick={() => handleFilterByTag(tag)}
                  className="capitalize"
                />
              ))}
            </div>
          )}

          {/* Recent Thoughts Title for desktop & larger */}
          <div className="hidden lg:flex w-full max-w-2xl justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-medium">Recent Thoughts</h2>
            {/* No filter button for desktop */}
          </div>

          {/* Post list */}
          <div className="space-y-6 w-full max-w-2xl">
            {filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                compact
                onViewThread={handleViewThread}
              />
            ))}
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No thoughts found for this filter.</p>
                <CustomButton 
                  variant="link" 
                  onClick={() => setActiveFilter(null)}
                  className="mt-2"
                >
                  Clear filter
                </CustomButton>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* No 'Share a Thought' button in sidebar */}
          
          {/* Popular tags section (for desktop) */}
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm hidden lg:block">
            <h3 className="text-lg font-medium mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <Tag 
                  key={tag} 
                  text={tag}
                  color={activeFilter === tag ? "accent" : "default"}
                  onClick={() => handleFilterByTag(tag)}
                  className="capitalize"
                />
              ))}
            </div>
          </div>
          
          {/* Trending discussions */}
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-emerald" />
              Trending Discussions
            </h3>
            <ul className="space-y-4">
              {mockPosts.slice(0, 3).map(post => (
                <li key={post.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <a 
                    href={`/thread/${post.id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <h4 className="font-medium line-clamp-1">{post.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {post.reactions.like + post.reactions.love} reactions
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
