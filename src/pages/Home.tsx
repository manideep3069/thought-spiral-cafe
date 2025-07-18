import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { Tag } from '@/components/ui/tag';
import { mockPosts } from '@/data/mockData';
import { Filter, TrendingUp, Book, Music, Film, Mic, Paintbrush, MessageSquare } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getQuoteOfTheDay } from '@/utils/quoteUtils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeMediaType, setActiveMediaType] = useState<string | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const { toast } = useToast();
  
  const popularTags = ['philosophy', 'art', 'science', 'poetry', 'books', 'music', 'history', 'nature', 'fiction', 'psychology'];
  const mediaTypes = [
    { name: 'literature', icon: <Book className="h-4 w-4 mr-2" /> },
    { name: 'music', icon: <Music className="h-4 w-4 mr-2" /> },
    { name: 'movie', icon: <Film className="h-4 w-4 mr-2" /> },
    { name: 'podcast', icon: <Mic className="h-4 w-4 mr-2" /> },
    { name: 'art', icon: <Paintbrush className="h-4 w-4 mr-2" /> },
  ];

  // Check auth status
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

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
          const formattedPosts: Post[] = data.map(post => {
            // Parse the release_condition JSON if it exists
            let releaseCondition;
            if (post.release_condition) {
              try {
                if (typeof post.release_condition === 'string') {
                  const parsedCondition = JSON.parse(post.release_condition);
                  releaseCondition = {
                    requiredReplies: parsedCondition.requiredReplies,
                    releaseDate: parsedCondition.releaseDate
                  };
                } else if (typeof post.release_condition === 'object') {
                  // Check if the object has the expected properties
                  const condition = post.release_condition as Record<string, any>;
                  releaseCondition = {
                    requiredReplies: condition.requiredReplies !== undefined ? 
                      Number(condition.requiredReplies) : undefined,
                    releaseDate: condition.releaseDate || undefined
                  };
                }
              } catch (e) {
                console.error('Error parsing release condition:', e);
                releaseCondition = undefined;
              }
            }
            
            return {
              id: post.id,
              title: post.media_title || "Untitled",
              content: post.content,
              authorId: post.user_id,
              mediaMetadata: {
                type: (post.media_type as 'literature' | 'movie' | 'music' | 'quote' | 'thought' | 'art' | 'podcast') || 'thought',
                title: post.media_title || ""
              },
              openToDiscussion: post.is_open_for_discussion || false,
              isScheduled: post.is_scheduled || false,
              releaseAt: post.release_at,
              releaseCondition: releaseCondition,
              tags: [], // We'll need to add tags later when we implement them in the database
              createdAt: post.created_at || new Date().toISOString(),
              reactions: { 
                felt_that: 0, 
                mind_blown: 0, 
                still_thinking: 0, 
                changed_me: 0 
              }
            };
          });
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
  
  // New function to fetch discussion counts for trending section
  useEffect(() => {
    async function fetchTrendingPosts() {
      try {
        // First get unique post_ids from discussions table
        const { data: discussionData, error: discussionError } = await supabase
          .from('discussions')
          .select('post_id');
        
        if (discussionError) {
          console.error('Error fetching discussion data:', discussionError);
          // Use a subset of the posts we already have for trending instead of trying to fetch
          setTrendingPosts(posts.slice(0, 3));
          return;
        }
        
        // Check if the response is valid
        if (!discussionData || !Array.isArray(discussionData)) {
          console.error('Invalid discussion data response:', discussionData);
          setTrendingPosts(posts.slice(0, 3));
          return;
        }
        
        // Count discussions for each post_id
        if (discussionData.length > 0) {
          // Create a map to count discussions per post
          const discussionCounts = discussionData.reduce((acc, item) => {
            const postId = item.post_id;
            if (!acc[postId]) {
              acc[postId] = 0;
            }
            acc[postId] += 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Convert to array of post_id and count for sorting
          const countArray = Object.entries(discussionCounts).map(([postId, count]) => ({
            post_id: postId,
            count
          }));
          
          // Sort by discussion count (descending)
          const sortedCounts = countArray.sort((a, b) => b.count - a.count).slice(0, 5);
          
          if (sortedCounts.length > 0) {
            // Get post details for trending posts
            const postIds = sortedCounts.map(item => item.post_id);
            
            try {
              const { data: trendingPostsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .in('id', postIds);
                
              if (postsError) {
                console.error('Error fetching trending posts:', postsError);
                setTrendingPosts(posts.slice(0, 3));
                return;
              }
              
              // Validate the response
              if (!trendingPostsData || !Array.isArray(trendingPostsData)) {
                console.error('Invalid trending posts data response:', trendingPostsData);
                setTrendingPosts(posts.slice(0, 3));
                return;
              }
              
              if (trendingPostsData.length > 0) {
                // Format posts and add them to state
                const formattedPosts: Post[] = trendingPostsData.map(post => {
                  // Parse the release_condition JSON if it exists
                  let releaseCondition;
                  if (post.release_condition) {
                    try {
                      if (typeof post.release_condition === 'string') {
                        releaseCondition = JSON.parse(post.release_condition);
                      } else if (typeof post.release_condition === 'object') {
                        const condition = post.release_condition as Record<string, any>;
                        releaseCondition = {
                          requiredReplies: condition.requiredReplies !== undefined ? 
                            Number(condition.requiredReplies) : undefined,
                          releaseDate: condition.releaseDate || undefined
                        };
                      }
                    } catch (e) {
                      console.error('Error parsing release condition:', e);
                      releaseCondition = undefined;
                    }
                  }
                  
                  return {
                    id: post.id,
                    title: post.media_title || "Untitled",
                    content: post.content,
                    authorId: post.user_id,
                    mediaMetadata: {
                      type: (post.media_type as 'literature' | 'movie' | 'music' | 'quote' | 'thought' | 'art' | 'podcast') || 'thought',
                      title: post.media_title || ""
                    },
                    openToDiscussion: post.is_open_for_discussion || false,
                    isScheduled: post.is_scheduled || false,
                    releaseAt: post.release_at,
                    releaseCondition: releaseCondition,
                    tags: [], // We'll add tags later when implemented
                    createdAt: post.created_at || new Date().toISOString(),
                    reactions: { 
                      felt_that: 0, 
                      mind_blown: 0, 
                      still_thinking: 0, 
                      changed_me: 0 
                    }
                  };
                });
                
                // Sort by discussion count (which we have from our counted array)
                const sortedTrendingPosts = formattedPosts.sort((a, b) => {
                  const aCount = discussionCounts[a.id] || 0;
                  const bCount = discussionCounts[b.id] || 0;
                  return bCount - aCount;
                });
                
                setTrendingPosts(sortedTrendingPosts);
              } else {
                setTrendingPosts(posts.slice(0, 3));
              }
            } catch (fetchError) {
              console.error('Error during trending posts fetch:', fetchError);
              setTrendingPosts(posts.slice(0, 3));
            }
          } else {
            setTrendingPosts(posts.slice(0, 3));
          }
        } else {
          setTrendingPosts(posts.slice(0, 3));
        }
      } catch (err) {
        console.error('Exception when fetching trending posts:', err);
        // Fallback to showing a subset of regular posts when trending fetch fails
        setTrendingPosts(posts.slice(0, 3));
      }
    }
    
    if (posts.length > 0) {
      fetchTrendingPosts();
    }
  }, [posts]);
  
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

  // Get the quote of the day from our utility
  const quoteOfTheDay = getQuoteOfTheDay();

  const handleSignInRequired = () => {
    toast({
      title: "Sign in required",
      description: "Please sign in to interact with posts",
    });
    navigate('/auth');
  };

  return (
    <Layout>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center">
          {/* Quote section */}
          <div className="mb-8 p-6 bg-gradient-to-br from-lavender/10 to-emerald/10 rounded-2xl border border-border shadow-sm w-full max-w-2xl">
            <blockquote className="pl-4 border-l-4 border-lavender italic">
              <p className="text-foreground/80">{quoteOfTheDay.text}</p>
              <footer className="mt-2 text-sm text-muted-foreground">— {quoteOfTheDay.author}</footer>
            </blockquote>
          </div>
          
          {/* Removed the sign in prompt for unauthenticated users */}
          
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
                  onClick={() => {
                    setActiveMediaType(null);
                  }}
                >
                  Clear filters
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
                  isAuthenticated={!!user}
                  onAuthRequired={handleSignInRequired}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No thoughts found for this filter.</p>
                {(activeFilter || activeMediaType) && (
                  <CustomButton 
                    variant="link" 
                    onClick={() => {
                      setActiveFilter(null);
                      setActiveMediaType(null);
                    }}
                    className="mt-2"
                  >
                    Clear all filters
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
          
          {/* Trending discussions - now sorted by spiral counts */}
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-emerald" />
              Trending Discussions
            </h3>
            <ul className="space-y-4">
              {trendingPosts.length > 0 ? (
                trendingPosts.map(post => (
                  <li key={post.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <a 
                      href={`/thread/${post.id}`}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {/* Show the actual count */}
                          {trendingPosts.indexOf(post) + 1} in spirals
                        </span>
                      </p>
                    </a>
                  </li>
                ))
              ) : (
                posts.slice(0, 3).map(post => (
                  <li key={post.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <a 
                      href={`/thread/${post.id}`}
                      className="block hover:text-primary transition-colors"
                    >
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">New discussion</p>
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;