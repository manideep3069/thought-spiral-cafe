
import React, { useState } from "react";
import { Reply, User, ReactionType } from "@/types";
import { getUserById, getNestedReplies } from "@/data/mockData";
import { format } from "date-fns";
import { Heart, ThumbsUp, MessageSquare, Frown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReplyCardProps {
  reply: Reply;
  level?: number;
  maxLevel?: number;
  postId: string;
  spiralName?: string;
}

export const ReplyCard: React.FC<ReplyCardProps> = ({ 
  reply,
  level = 0,
  maxLevel = 5,
  postId,
  spiralName
}) => {
  const [expanded, setExpanded] = React.useState(level < 3);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const author = getUserById(reply.authorId);
  const nestedReplies = getNestedReplies(reply.id);
  const hasNestedReplies = nestedReplies.length > 0;
  
  const handleReaction = async (type: ReactionType) => {
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to react to this reply");
        return;
      }
      
      // This can be implemented with Supabase in the future
      // For now we just log to console
      console.log(`Reacted with ${type} to reply ${reply.id}`);
      toast.success(`Reacted with ${type}`);
    } catch (error) {
      console.error("Error reacting:", error);
      toast.error("Failed to add reaction");
    }
  };
  
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to reply");
        setSubmitting(false);
        return;
      }
      
      // Add reply to supabase
      const { data: newReply, error } = await supabase
        .from('discussions')
        .insert([
          { 
            post_id: postId,
            user_id: session.user.id,
            content: replyContent,
            parent_discussion_id: reply.id
          }
        ])
        .select();
      
      if (error) {
        console.error("Error posting reply:", error);
        toast.error("Failed to post reply: " + error.message);
        setSubmitting(false);
        return;
      }
      
      toast.success("Reply posted successfully");
      setReplyContent("");
      setShowReplyForm(false);
      
      // In a real app, we would update the UI with the new reply
      // For now just reload the page to see the changes
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  
  const reactionIcons = {
    'felt_that': <Heart className="h-3 w-3 mr-1" />,
    'mind_blown': <AlertCircle className="h-3 w-3 mr-1" />,
    'still_thinking': <Frown className="h-3 w-3 mr-1" />,
    'changed_me': <ThumbsUp className="h-3 w-3 mr-1 rotate-180" />
  };

  const reactions = Object.entries(reply.reactions || {
    felt_that: 0,
    mind_blown: 0,
    still_thinking: 0,
    changed_me: 0
  })
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as ReactionType,
      count
    }));

  // Define a set of colors for the spiral levels
  const spiralColors = [
    "border-l-emerald",
    "border-l-lavender",
    "border-l-cafe",
    "border-l-emerald/70",
    "border-l-lavender/70"
  ];
  
  // Get the spiral color class based on the nesting level
  const spiralColorClass = spiralColors[level % spiralColors.length];

  return (
    <div 
      className={cn(
        "pl-4 relative",
        level > 0 && `ml-2 border-l-2 ${spiralColorClass}`,
        level > 0 && "spiral-thread"
      )}
    >
      {level > 0 && (
        <div 
          className={`absolute w-4 h-4 rounded-full -left-[0.35rem] top-6 bg-${spiralColorClass.replace('border-l-', '')}`}
          style={{ 
            backgroundColor: level % 3 === 0 ? 'rgb(var(--emerald))' : 
                             level % 3 === 1 ? 'rgb(var(--lavender))' : 
                             'rgb(var(--cafe))'
          }}
        />
      )}
      
      <div className="my-4">
        {/* Author info */}
        <div className="flex items-center mb-2">
          <div className="h-8 w-8 rounded-full bg-lavender/20 flex items-center justify-center overflow-hidden">
            {author?.avatar ? (
              <img 
                src={author.avatar} 
                alt={author.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lavender font-semibold text-xs">
                {author?.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-2">
            <p className="font-medium text-sm text-foreground">{author?.name || "Anonymous"}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(reply.createdAt), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
        </div>
        
        {/* Spiral name if this is a top level reply */}
        {level === 0 && spiralName && (
          <div className="mb-2">
            <span className="text-xs font-medium bg-lavender/10 text-lavender px-2 py-1 rounded-full">
              {spiralName}
            </span>
          </div>
        )}
        
        {/* Reply content */}
        <div className="mt-1 text-sm text-foreground/90 whitespace-pre-line">
          {reply.content}
        </div>
        
        {/* Reactions and reply button */}
        <div className="flex items-center mt-2 space-x-4">
          <div className="flex space-x-2">
            {reactions.length > 0 ? (
              reactions.map(reaction => (
                <button 
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full"
                >
                  {reactionIcons[reaction.type]}
                  {reaction.count}
                </button>
              ))
            ) : (
              <>
                <button onClick={() => handleReaction('felt_that')} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full">
                  <Heart className="h-3 w-3 mr-1" />
                  Felt that
                </button>
                
                <button onClick={() => handleReaction('mind_blown')} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Mind blown
                </button>
              </>
            )}
          </div>
          
          <button 
            className="text-xs text-primary font-medium hover:underline inline-flex items-center"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Continue spiral
          </button>
        </div>
        
        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-4">
            <form onSubmit={handleSubmitReply}>
              <Textarea
                placeholder="Continue the spiral..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px] text-sm"
                disabled={submitting}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? 'Posting...' : 'Add to spiral'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Nested replies - the spiral continues */}
      {hasNestedReplies && expanded && level < maxLevel && (
        <div className="mt-1 spiral-content">
          {nestedReplies.map(nestedReply => (
            <ReplyCard 
              key={nestedReply.id} 
              reply={nestedReply} 
              level={level + 1}
              maxLevel={maxLevel}
              postId={postId}
            />
          ))}
        </div>
      )}
      
      {/* Show/hide nested replies button */}
      {hasNestedReplies && level < maxLevel && (
        <button 
          className="text-xs font-medium text-primary hover:underline mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Collapse spiral" : `Continue spiral (${nestedReplies.length})`}
        </button>
      )}
      
      {/* Max depth reached indicator */}
      {hasNestedReplies && level >= maxLevel && (
        <div className="mt-1 text-xs text-muted-foreground">
          <button className="text-primary hover:underline">
            Spiral continues →
          </button>
        </div>
      )}
    </div>
  );
};
