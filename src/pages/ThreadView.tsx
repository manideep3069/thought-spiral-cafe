
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/post/PostCard';
import { ReplyCard } from '@/components/post/ReplyCard';
import { getPostById, getRepliesForPost } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';

const ThreadView: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const post = postId ? getPostById(postId) : null;
  const topLevelReplies = postId ? getRepliesForPost(postId).filter(reply => !reply.parentReplyId) : [];
  
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
