
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { ReplyCard } from '@/components/post/ReplyCard';
import { getPostById, getRepliesForPost } from '@/data/mockData';
import { ArrowLeft, Clock, LockIcon } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { supabase } from '@/integrations/supabase/client';
import { Post, Reply } from '@/types';
import { toast } from 'sonner';

const ThreadView: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const fetchReplies = async () => {
    if (!postId) return;
    
    try {
      const { data: supabaseReplies, error } = await supabase
        .from('discussions')
        .select('*')
        .eq('post_id', postId)
        .is('parent_discussion_id', null)
        .order('created_at', { ascending: false });
        
      if (supabaseReplies && !error) {
        // Format supabase replies to match our Reply type
        const formattedReplies: Reply[] = supabaseReplies.map(reply => ({
          id: reply.id,
          content: reply.content || '',
          authorId: reply.user_id,
          postId: reply.post_id,
          parentReplyId: reply.parent_discussion_id,
          createdAt: reply.created_at,
          reactions: {
            felt_that: 0,
            mind_blown: 0,
            still_thinking: 0,
            changed_me: 0
          }
        }));
        setReplies(formattedReplies);
      } else {
        // Fallback to mock data
        const mockReplies = getRepliesForPost(postId).filter(reply => !reply.parentReplyId);
        setReplies(mockReplies);
      }
    } catch (err) {
      console.error("Error fetching replies:", err);
      // Fallback to mock data
      const mockReplies = getRepliesForPost(postId).filter(reply => !reply.parentReplyId);
      setReplies(mockReplies);
    }
  };
  
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;
      
      // First try to get post from supabase if available
      try {
        const { data: supabasePost, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (supabasePost && !error) {
          // Format the post data to match our Post type
          // Ensure media_type is one of the expected types or default to "thought"
          const mediaType = supabasePost.media_type as "thought" | "book" | "movie" | "music" | "quote" | null;
          
          const formattedPost: Post = {
            id: supabasePost.id,
            title: supabasePost.media_title || 'Untitled',
            content: supabasePost.content || '',
            authorId: supabasePost.user_id,
            mediaMetadata: {
              type: mediaType || 'thought',
              title: supabasePost.media_title,
            },
            openToDiscussion: supabasePost.is_open_for_discussion || false,
            tags: [],
            createdAt: supabasePost.created_at,
            reactions: {
              felt_that: 0,
              mind_blown: 0,
              still_thinking: 0,
              changed_me: 0
            },
            isScheduled: supabasePost.is_scheduled || false,
            releaseAt: supabasePost.release_at,
            releaseCondition: supabasePost.release_condition
          };
          
          setPost(formattedPost);
        } else {
          // Fallback to mock data
          const mockPost = getPostById(postId);
          setPost(mockPost);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        // Fallback to mock data
        const mockPost = getPostById(postId);
        setPost(mockPost);
      }
      
      await fetchReplies();
      setLoading(false);
    };
    
    fetchPostData();
  }, [postId]);
  
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    
    if (!postId) {
      toast.error("Missing post ID");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to comment");
        setSubmitting(false);
        return;
      }
      
      // Add reply to supabase
      const { data: newReply, error } = await supabase
        .from('discussions')
        .insert([
          { 
            post_id: postId,
            user_id: user.id,
            content: replyContent,
            parent_discussion_id: null
          }
        ])
        .select();
      
      if (error) {
        console.error("Error posting reply:", error);
        
        // If it's an RLS error, show more helpful error message
        if (error.code === '42501') {
          toast.error("You don't have permission to post. Please try signing in again.");
        } else {
          toast.error("Failed to post reply: " + error.message);
        }
        
        // Fallback to mock data reply if in development environment
        if (process.env.NODE_ENV === 'development') {
          const mockReply: Reply = {
            id: Math.random().toString(),
            content: replyContent,
            authorId: user.id,
            postId: postId,
            parentReplyId: null,
            createdAt: new Date().toISOString(),
            reactions: {
              felt_that: 0,
              mind_blown: 0,
              still_thinking: 0,
              changed_me: 0
            }
          };
          
          // Add to replies state
          setReplies(prevReplies => [mockReply, ...prevReplies]);
          setReplyContent('');
          toast.success("Reply posted successfully (Mock Mode)");
        }
        
        setSubmitting(false);
        return;
      }
      
      if (!newReply || newReply.length === 0) {
        toast.error("No reply data returned");
        setSubmitting(false);
        return;
      }
      
      // Format the new reply to match our Reply type
      const formattedReply: Reply = {
        id: newReply[0].id,
        content: newReply[0].content || '',
        authorId: newReply[0].user_id,
        postId: newReply[0].post_id,
        parentReplyId: newReply[0].parent_discussion_id,
        createdAt: newReply[0].created_at,
        reactions: {
          felt_that: 0,
          mind_blown: 0,
          still_thinking: 0,
          changed_me: 0
        }
      };
      
      // Add to replies state
      setReplies(prevReplies => [formattedReply, ...prevReplies]);
      setReplyContent('');
      
      // Check if this post has a release condition based on reply count
      if (post?.isScheduled && post.releaseCondition?.requiredReplies) {
        if (replies.length + 1 >= post.releaseCondition.requiredReplies) {
          // Optimistically update the UI first
          setPost(prev => prev ? {
            ...prev,
            isScheduled: false,
            openToDiscussion: true
          } : null);
          
          toast.success("Your reply has unlocked this post!");
        }
      }
      
      toast.success("Reply posted successfully");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-medium mb-4">Thought Not Found</h2>
          <p className="text-muted-foreground mb-6">The discussion you're looking for doesn't exist or has been removed.</p>
          <CustomButton variant="default" onClick={() => navigate('/')}>
            Return Home
          </CustomButton>
        </div>
      </Layout>
    );
  }
  
  // Get top level replies only
  const topLevelReplies = replies.filter(reply => !reply.parentReplyId);
  
  // Check if post is scheduled and not yet released
  const isScheduledAndNotReleased = post.isScheduled && !post.openToDiscussion;
  
  // Calculate progress for scheduled posts with required replies
  const replyProgress = post.releaseCondition?.requiredReplies 
    ? Math.min(Math.round((replies.length / post.releaseCondition.requiredReplies) * 100), 100)
    : 0;
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        
        {/* Main post */}
        <PostCard post={post} />
        
        {/* Reply form - only show if post is not scheduled or already released */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-medium mb-4">Join the Discussion</h3>
          
          {isScheduledAndNotReleased ? (
            <div className="p-6 bg-card border border-border rounded-2xl">
              <div className="flex items-center mb-4">
                <LockIcon className="h-5 w-5 text-amber-500 mr-2" />
                <h4 className="font-medium">This thought is scheduled for future release</h4>
              </div>
              
              {post.releaseCondition?.requiredReplies && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This thought will be unlocked after {post.releaseCondition.requiredReplies} replies.
                    Your contribution helps unlock the content!
                  </p>
                  
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${replyProgress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-right">
                    {replies.length} of {post.releaseCondition.requiredReplies} replies
                  </p>
                </div>
              )}
              
              {post.releaseAt && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  This thought will be unlocked on {new Date(post.releaseAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitReply}>
              <textarea 
                className="w-full p-4 rounded-2xl border border-border bg-card min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Share your thoughts..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={submitting}
              />
              <div className="mt-4 flex justify-end">
                <CustomButton 
                  variant="accent" 
                  type="submit" 
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </CustomButton>
              </div>
            </form>
          )}
        </div>
        
        {/* Replies */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">
            Replies {topLevelReplies.length > 0 && `(${topLevelReplies.length})`}
          </h3>
          
          {topLevelReplies.length > 0 ? (
            <div className="space-y-2">
              {topLevelReplies.map(reply => (
                <ReplyCard 
                  key={reply.id} 
                  reply={reply} 
                  postId={postId || ''}  
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">
                {isScheduledAndNotReleased && post.releaseCondition?.requiredReplies
                  ? "Be the first to help unlock this thought by replying!"
                  : "No replies yet. Be the first to share your thoughts!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ThreadView;
