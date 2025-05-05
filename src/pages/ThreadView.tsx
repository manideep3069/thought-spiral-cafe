import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { mockPosts, Post, getUserById } from '@/data/mockData';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isValid } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ThreadView: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    async function fetchPost() {
      if (!postId) {
        toast({
          title: "Error",
          description: "Post ID is missing.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (postError) {
          console.error('Error fetching post:', postError);
          toast({
            title: "Error",
            description: "Failed to load post.",
            variant: "destructive",
          });
          return;
        }
        
        if (postData) {
          // Transform Supabase data to match Post type
          let releaseCondition;
          if (postData.release_condition) {
            try {
              if (typeof postData.release_condition === 'string') {
                const parsedCondition = JSON.parse(postData.release_condition);
                releaseCondition = {
                  requiredReplies: parsedCondition.requiredReplies,
                  releaseDate: parsedCondition.releaseDate
                };
              } else if (typeof postData.release_condition === 'object') {
                // Check if the object has the expected properties
                const condition = postData.release_condition as Record<string, any>;
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
          
          const formattedPost: Post = {
            id: postData.id,
            title: postData.media_title || "Untitled",
            content: postData.content,
            authorId: postData.user_id,
            mediaMetadata: {
              type: (postData.media_type as 'literature' | 'movie' | 'music' | 'quote' | 'thought' | 'art' | 'podcast') || 'thought',
              title: postData.media_title || ""
            },
            openToDiscussion: postData.is_open_for_discussion || false,
            isScheduled: postData.is_scheduled || false,
            releaseAt: postData.release_at,
            releaseCondition: releaseCondition,
            tags: [], // We'll need to add tags later when we implement them in the database
            createdAt: postData.created_at || new Date().toISOString(),
            reactions: { 
              felt_that: 0, 
              mind_blown: 0, 
              still_thinking: 0, 
              changed_me: 0 
            }
          };
          setPost(formattedPost);
        } else {
          toast({
            title: "Not found",
            description: "Post not found.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (err) {
        console.error('Exception when fetching post:', err);
        toast({
          title: "Error",
          description: "Failed to load post.",
          variant: "destructive",
        });
      }
    }
    
    fetchPost();
  }, [postId, navigate, toast]);

  useEffect(() => {
    async function fetchReplies() {
      if (!postId) return;
      
      try {
        const { data: repliesData, error: repliesError } = await supabase
          .from('post_replies')
          .select('*, user:user_id(*)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        
        if (repliesError) {
          console.error('Error fetching replies:', repliesError);
          toast({
            title: "Error",
            description: "Failed to load replies.",
            variant: "destructive",
          });
          return;
        }
        
        if (repliesData) {
          setReplies(repliesData);
        }
      } catch (err) {
        console.error('Exception when fetching replies:', err);
        toast({
          title: "Error",
          description: "Failed to load replies.",
          variant: "destructive",
        });
      }
    }
    
    fetchReplies();
  }, [postId, toast]);
  
  const handleAuthRequired = () => {
    toast({
      title: "Sign in required",
      description: "Please sign in to interact with posts and reply to discussions",
    });
    navigate('/auth');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast({
        title: "Missing reply",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      handleAuthRequired();
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to reply.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: replyContent.trim(),
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error("Error creating reply:", error);
        toast({
          title: "Error",
          description: "Failed to create reply. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your reply has been posted!",
        });
        setReplyContent('');
        // Refresh replies
        fetchReplies();
      }
    } catch (err) {
      console.error("Error submitting reply:", err);
      toast({
        title: "Error",
        description: "Failed to create reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy 'at' h:mm a") : "Unknown date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };
  
  async function fetchReplies() {
    if (!postId) return;
    
    try {
      const { data: repliesData, error: repliesError } = await supabase
        .from('post_replies')
        .select('*, user:user_id(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        toast({
          title: "Error",
          description: "Failed to load replies.",
          variant: "destructive",
        });
        return;
      }
      
      if (repliesData) {
        setReplies(repliesData);
      }
    } catch (err) {
      console.error('Exception when fetching replies:', err);
      toast({
        title: "Error",
        description: "Failed to load replies.",
        variant: "destructive",
      });
    }
  }

  if (!post) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto mt-8">
        <PostCard 
          post={post} 
          isAuthenticated={!!user}
          onAuthRequired={handleAuthRequired}
        />
        
        {/* Sign in prompt for unauthenticated users before the reply form */}
        {!user && (
          <div className="mb-8 p-6 bg-card border border-border rounded-2xl shadow-sm w-full">
            <h2 className="text-xl font-serif font-medium mb-2">Join the conversation</h2>
            <p className="text-muted-foreground mb-4">Sign in to reply to this discussion.</p>
            <div className="flex gap-2">
              <CustomButton variant="default" onClick={() => navigate('/auth')}>
                Sign In
              </CustomButton>
              <CustomButton variant="accent" onClick={() => navigate('/auth')}>
                Create Account
              </CustomButton>
            </div>
          </div>
        )}

        {/* Only show reply form to authenticated users */}
        {user && (
          <form onSubmit={handleSubmitReply} className="mt-6">
            <div className="mb-4">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full rounded-md border border-border p-3 resize-none"
              />
            </div>
            <CustomButton type="submit">
              Post Reply
            </CustomButton>
          </form>
        )}
        
        {/* Replies Section */}
        <div className="mt-8">
          <h4 className="text-xl font-serif font-medium mb-4">Replies:</h4>
          {replies.length > 0 ? (
            <ul className="space-y-4">
              {replies.map(reply => (
                <li key={reply.id} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.user?.avatar_url} alt={reply.user?.name} />
                      <AvatarFallback>{reply.user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{reply.user?.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(reply.created_at)}</p>
                      </div>
                      <p className="text-sm text-foreground/80">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ThreadView;
