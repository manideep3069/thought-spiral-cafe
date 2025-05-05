import React, { useState } from "react";
import { Post, User, ReactionType } from "@/types";
import { getUserById } from "@/data/mockData";
import { CustomButton } from "@/components/ui/custom-button";
import { Tag } from "@/components/ui/tag";
import { format, isValid } from "date-fns";
import { Heart, MessageSquare, Share2, ThumbsUp, Frown, AlertCircle, Book, Music, Film, Mic, Brain, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShareDialog } from "@/components/share/ShareDialog";

interface PostCardProps {
  post: Post;
  compact?: boolean;
  onViewThread?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  compact = false,
  onViewThread 
}) => {
  const author = getUserById(post.authorId);
  const defaultReactions = {
    felt_that: 0,
    mind_blown: 0,
    still_thinking: 0,
    changed_me: 0
  };
  
  const [postReactions, setPostReactions] = useState(post.reactions || defaultReactions);
  const [activeReactions, setActiveReactions] = useState<Record<ReactionType, boolean>>({
    felt_that: false,
    mind_blown: false,
    still_thinking: false,
    changed_me: false
  });
  const [isAnimating, setIsAnimating] = useState<Record<ReactionType, boolean>>({
    felt_that: false,
    mind_blown: false,
    still_thinking: false,
    changed_me: false
  });
  
  const handleReaction = async (type: ReactionType) => {
    try {
      setIsAnimating(prev => ({ ...prev, [type]: true }));
      
      // Toggle the active state of the reaction
      const newActiveState = !activeReactions[type];
      setActiveReactions(prev => ({ ...prev, [type]: newActiveState }));
      
      // Update the count based on the new active state
      const newCount = newActiveState 
        ? (postReactions[type] + 1) 
        : (postReactions[type] - 1);
      
      setPostReactions(prev => ({
        ...prev,
        [type]: newCount < 0 ? 0 : newCount
      }));
      
      setTimeout(() => {
        setIsAnimating(prev => ({ ...prev, [type]: false }));
      }, 300);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('post_reactions')
          .upsert(
            { 
              post_id: post.id, 
              user_id: user.id,
              reaction_type: type
            },
            { onConflict: 'post_id,user_id,reaction_type' }
          );
        
        if (error) {
          console.log(`Reaction error: ${error.message}`);
          toast.error("Error reacting to post");
        }
      }
      
      console.log(`Reacted with ${type} to post ${post.id}`);
    } catch (err) {
      console.error("Error handling reaction:", err);
      toast.error("Error reacting to post");
    }
  };
  
  const handleOpenDiscussion = () => {
    onViewThread && onViewThread(post.id);
  };
  
  const reactionIcons = {
    felt_that: <Heart className="h-4 w-4 mr-1" />,
    mind_blown: <Brain className="h-4 w-4 mr-1" />,
    still_thinking: <Clock className="h-4 w-4 mr-1" />,
    changed_me: <Sparkles className="h-4 w-4 mr-1" />
  };

  const reactionLabels = {
    felt_that: "Felt that",
    mind_blown: "Mind blown",
    still_thinking: "Still thinking about this...",
    changed_me: "Changed me a little"
  };

  const reactionColors = {
    felt_that: "text-red-500 hover:text-red-400", 
    mind_blown: "text-purple-500 hover:text-purple-400",
    still_thinking: "text-blue-500 hover:text-blue-400",
    changed_me: "text-emerald-500 hover:text-emerald-400"
  };

  const mediaTypeIcons: Record<string, React.ReactNode> = {
    book: <Book className="h-4 w-4 mr-1 text-blue-500" />,
    music: <Music className="h-4 w-4 mr-1 text-purple-500" />,
    movie: <Film className="h-4 w-4 mr-1 text-red-500" />,
    podcast: <Mic className="h-4 w-4 mr-1 text-green-500" />
  };

  const isScheduledAndNotReleased = post.isScheduled && !post.openToDiscussion;

  const reactions = postReactions 
    ? Object.entries(postReactions)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ReactionType,
        count
      }))
    : [];
    
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "Unknown date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const getReleaseConditionText = () => {
    if (!post.releaseCondition) return null;
    
    if (post.releaseCondition.releaseDate) {
      return `Will be released on ${formatDate(post.releaseCondition.releaseDate)}`;
    }
    
    if (post.releaseCondition.requiredReplies) {
      return `Will be released after ${post.releaseCondition.requiredReplies} replies`;
    }
    
    return "Scheduled for future release";
  };

  if (!post || !post.id) {
    return (
      <article className="bg-card rounded-2xl p-6 shadow-md border border-border">
        <p className="text-muted-foreground">Error loading post</p>
      </article>
    );
  }

  const shareUrl = `${window.location.origin}/thread/${post.id}`;

  return (
    <article className={cn(
      "bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-border",
      compact ? "max-w-2xl" : "w-full",
      isScheduledAndNotReleased ? "opacity-75" : ""
    )}>
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-lavender/20 flex items-center justify-center overflow-hidden">
          {author?.avatar ? (
            <img 
              src={author.avatar} 
              alt={author.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lavender font-semibold text-sm">
              {author?.name.substring(0, 2).toUpperCase() || "AN"}
            </span>
          )}
        </div>
        <div className="ml-3">
          <p className="font-medium text-foreground">{author?.name || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground">
            {post.createdAt ? formatDate(post.createdAt) : "Unknown date"}
          </p>
        </div>
      </div>
      
      {isScheduledAndNotReleased && (
        <div className="mb-3 py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
          <p className="text-sm flex items-center text-amber-600">
            <Clock className="h-4 w-4 mr-2" />
            {getReleaseConditionText()}
          </p>
        </div>
      )}
      
      <h3 className="text-xl font-serif font-semibold mb-2">{post.title}</h3>
      
      {post.mediaMetadata?.type && post.mediaMetadata.type !== 'thought' && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
            {mediaTypeIcons[post.mediaMetadata.type] || null}
            {post.mediaMetadata.type}
          </span>
        </div>
      )}
      
      {post.mediaMetadata?.type === 'quote' && (
        <div className="my-4 pl-4 border-l-4 border-lavender italic text-foreground/80">
          "{post.mediaMetadata.title}"
          {post.mediaMetadata.author && (
            <span className="block text-sm mt-1 text-muted-foreground">— {post.mediaMetadata.author}</span>
          )}
        </div>
      )}
      
      <p className="text-foreground/90 mb-4 whitespace-pre-line">
        {compact && post.content.length > 200 
          ? `${post.content.substring(0, 200)}...` 
          : post.content
        }
      </p>
      
      {post.mediaMetadata && post.mediaMetadata.type !== 'quote' && post.mediaMetadata.title && post.mediaMetadata.type !== 'thought' && (
        <div className="mb-4 p-3 bg-muted rounded-xl text-sm">
          <p className="font-medium">
            {post.mediaMetadata.type.charAt(0).toUpperCase() + post.mediaMetadata.type.slice(1)}:
            {' '}{post.mediaMetadata.title}
          </p>
          {post.mediaMetadata.author && (
            <p className="text-muted-foreground">
              By {post.mediaMetadata.author}
              {post.mediaMetadata.year && ` (${post.mediaMetadata.year})`}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags && post.tags.length > 0 ? post.tags.map(tag => (
          <Tag key={tag} text={tag} color="primary" />
        )) : (
          <Tag text="general" color="default" />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleReaction('felt_that')}
            className={cn(
              "inline-flex items-center whitespace-nowrap text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.felt_that ? "bg-red-500/10 font-medium border-red-500/30" : "border-border hover:bg-muted/50",
              reactionColors.felt_that,
              isAnimating.felt_that && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.felt_that}
            {reactionLabels.felt_that}
            {postReactions.felt_that > 0 && <span className="ml-1">{postReactions.felt_that}</span>}
          </button>
          <button 
            onClick={() => handleReaction('mind_blown')}
            className={cn(
              "inline-flex items-center whitespace-nowrap text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.mind_blown ? "bg-purple-500/10 font-medium border-purple-500/30" : "border-border hover:bg-muted/50",
              reactionColors.mind_blown,
              isAnimating.mind_blown && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.mind_blown}
            {reactionLabels.mind_blown}
            {postReactions.mind_blown > 0 && <span className="ml-1">{postReactions.mind_blown}</span>}
          </button>
          <button 
            onClick={() => handleReaction('still_thinking')}
            className={cn(
              "inline-flex items-center whitespace-nowrap text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.still_thinking ? "bg-blue-500/10 font-medium border-blue-500/30" : "border-border hover:bg-muted/50",
              reactionColors.still_thinking,
              isAnimating.still_thinking && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.still_thinking}
            {postReactions.still_thinking > 0 ? <span>Still thinking... {postReactions.still_thinking}</span> : "Still thinking..."}
          </button>
          <button 
            onClick={() => handleReaction('changed_me')}
            className={cn(
              "inline-flex items-center whitespace-nowrap text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.changed_me ? "bg-emerald-500/10 font-medium border-emerald-500/30" : "border-border hover:bg-muted/50",
              reactionColors.changed_me,
              isAnimating.changed_me && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.changed_me}
            {reactionLabels.changed_me}
            {postReactions.changed_me > 0 && <span className="ml-1">{postReactions.changed_me}</span>}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <CustomButton 
            variant="ghost" 
            size="sm" 
            onClick={handleOpenDiscussion}
            className="inline-flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {compact ? "View Thread" : "Open to Discussion"}
          </CustomButton>
          
          <ShareDialog title={post.title} url={shareUrl} />
        </div>
      </div>
      
      {isScheduledAndNotReleased && post.releaseCondition?.requiredReplies && (
        <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Replies progress: 0/{post.releaseCondition.requiredReplies}
        </div>
      )}
    </article>
  );
};
