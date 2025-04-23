
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockPosts } from '@/data/mockData';
import { Filter, TrendingUp, Book, Music, Film, Mic } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  
  const popularTags = ['philosophy', 'art', 'science', 'poetry', 'books', 'music', 'history', 'nature', 'fiction', 'psychology'];
  const mediaTypes = [
    { name: 'book', icon: <Book className="h-4 w-4 mr-2" /> },
    { name: 'music', icon: <Music className="h-4 w-4 mr-2" /> },
    { name: 'movie', icon: <Film className="h-4 w-4 mr-2" /> },
    { name: 'podcast', icon: <Mic className="h-4 w-4 mr-2" /> },
  ];

  // Fetch posts from Supabase
  useEffect(() => {
    async function fetchPosts() {
      try {
        let query = supabase.from('posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Apply media type filter if selected
        if (activeMediaType) {
          query = query.eq('media_type', activeMediaType);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching posts:', error);
          toast({
            title: "Error",
            description: "Failed to load posts. Using sample data instead.",
            variant: "destructive",
          });
          // Fall back to mock data
          setPosts(mockPosts);
        } else if (data && data.length > 0) {
          // Transform Supabase data to match Post type
          const formattedPosts: Post[] = data.map(post => ({
            id: post.id,
            title: post.media_title || "Untitled",
            content: post.content,
            authorId: post.user_id,
            mediaMetadata: {
              type: post.media_type as 'book' | 'movie' | 'music' | 'quote' || 'thought',
              title: post.media_title || ""
            },
            openToDiscussion: post.is_open_for_discussion || false,
            tags: [], // We'll need to add tags later when we implement them in the database
            createdAt: post.created_at || new Date().toISOString(),
            reactions: { like: 0, love: 0, wow: 0, sad: 0, angry: 0 }
          }));
          setPosts(formattedPosts);
        } else {
          // If no posts are found in Supabase, use mock data
          setPosts(mockPosts);
        }
      } catch (err) {
        console.error('Exception when fetching posts:', err);
        setPosts(mockPosts);
      }
    }
    
    fetchPosts();
  }, [activeMediaType, toast]);
  
  const handleViewThread = (postId: string) => {
    navigate(`/thread/${postId}`);
  };
  
  const handleFilterByTag = (tag: string) => {
    setActiveFilter(activeFilter === tag ? null : tag);
    setShowMobileFilter(false); // hide mobile filter on tag select
  };
  
  const handleFilterByMediaType = (mediaType: string) => {
    setActiveMediaType(activeMediaType === mediaType ? null : mediaType);
  };
  
  const filteredPosts = activeFilter 
    ? posts.filter(post => post.tags.includes(activeFilter))
    : posts;

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
          
          {/* Media Type Filters */}
          <div className="mb-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-3">Browse by Media</h3>
            <div className="flex flex-wrap gap-2">
              {mediaTypes.map((media) => (
                <CustomButton 
                  key={media.name}
                  variant={activeMediaType === media.name ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => handleFilterByMediaType(media.name)}
                >
                  {media.icon}
                  {media.name}
                </CustomButton>
              ))}
              {activeMediaType && (
                <CustomButton 
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveMediaType(null)}
                >
                  Clear filter
                </CustomButton>
              )}
            </div>
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
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  compact
                  onViewThread={handleViewThread}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No thoughts found for this filter.</p>
                {activeFilter && (
                  <CustomButton 
                    variant="link" 
                    onClick={() => setActiveFilter(null)}
                    className="mt-2"
                  >
                    Clear filter
                  </CustomButton>
                )}
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
              {posts.slice(0, 3).map(post => (
                <li key={post.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <a 
                    href={`/thread/${post.id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <h4 className="font-medium line-clamp-1">{post.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(post.reactions ? 
                        (post.reactions.like || 0) + (post.reactions.love || 0) : 0)} reactions
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
