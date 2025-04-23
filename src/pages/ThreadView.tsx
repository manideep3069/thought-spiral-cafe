
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { ReplyCard } from '@/components/post/ReplyCard';
import { getPostById, getRepliesForPost } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
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
          
          setPost({
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
              like: 0,
              love: 0,
              wow: 0,
              sad: 0,
              angry: 0
            }
          });
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
      
      // Get replies
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
              like: 0,
              love: 0,
              wow: 0,
              sad: 0,
              angry: 0
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
      
      setLoading(false);
    };
    
    fetchPostData();
  }, [postId]);
  
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
        
        {/* Reply form */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-medium mb-4">Join the Discussion</h3>
          <textarea 
            className="w-full p-4 rounded-2xl border border-border bg-card min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Share your thoughts..."
          />
          <div className="mt-4 flex justify-end">
            <CustomButton variant="accent">
              Post Reply
            </CustomButton>
          </div>
        </div>
        
        {/* Replies */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">
            Replies {topLevelReplies.length > 0 && `(${topLevelReplies.length})`}
          </h3>
          
          {topLevelReplies.length > 0 ? (
            <div className="space-y-2">
              {topLevelReplies.map(reply => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-2xl">
              <p className="text-muted-foreground">No replies yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ThreadView;
