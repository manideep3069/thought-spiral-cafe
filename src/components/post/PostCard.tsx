
import React, { useState } from "react";
import { Post, User, ReactionType } from "@/types";
import { getUserById } from "@/data/mockData";
import { CustomButton } from "@/components/ui/custom-button";
import { Tag } from "@/components/ui/tag";
import { format, isValid } from "date-fns";
import { Heart, MessageSquare, Share2, ThumbsUp, Frown, AlertCircle, Book, Music, Film, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  // Initialize with default values if post.reactions is undefined
  const defaultReactions = {
    like: 0,
    love: 0,
    wow: 0,
    sad: 0,
    angry: 0
  };
  
  const [postReactions, setPostReactions] = useState(post.reactions || defaultReactions);
  const [activeReactions, setActiveReactions] = useState<Record<ReactionType, boolean>>({
    like: false,
    love: false,
    wow: false,
    sad: false,
    angry: false
  });
  const [isAnimating, setIsAnimating] = useState<Record<ReactionType, boolean>>({
    like: false,
    love: false,
    wow: false,
    sad: false,
    angry: false
  });
  
  const handleReaction = async (type: ReactionType) => {
    try {
      // Optimistic UI update - animate and increment immediately
      setIsAnimating(prev => ({ ...prev, [type]: true }));
      setActiveReactions(prev => ({ ...prev, [type]: !prev[type] }));
      
      const newCount = activeReactions[type] 
        ? (postReactions[type] - 1) 
        : (postReactions[type] + 1);
      
      setPostReactions(prev => ({
        ...prev,
        [type]: newCount < 0 ? 0 : newCount
      }));
      
      // Clear animation after 300ms
      setTimeout(() => {
        setIsAnimating(prev => ({ ...prev, [type]: false }));
      }, 300);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fix: Pass a single object rather than an array to upsert
        const { error } = await supabase
          .from('post_reactions')
          .upsert(
            { 
              post_id: post.id, 
              user_id: user.id,
              reaction_type: type // This type needs to match what's in the database
            },
            { onConflict: 'post_id,user_id,reaction_type' }
          );
        
        if (error) {
          console.log(`Reaction error: ${error.message}`);
          // Silently fail, since we've already updated UI optimistically
        }
      }
      
      console.log(`Reacted with ${type} to post ${post.id}`);
    } catch (err) {
      console.error("Error handling reaction:", err);
      // Don't revert UI since that would be jarring
    }
  };
  
  const handleOpenDiscussion = () => {
    onViewThread && onViewThread(post.id);
  };
  
  const reactionIcons = {
    like: <ThumbsUp className="h-4 w-4 mr-1" />,
    love: <Heart className="h-4 w-4 mr-1" />,
    wow: <AlertCircle className="h-4 w-4 mr-1" />,
    sad: <Frown className="h-4 w-4 mr-1" />,
    angry: <Frown className="h-4 w-4 mr-1 rotate-180" />
  };

  const reactionColors = {
    like: "text-primary hover:text-primary/80", 
    love: "text-red-500 hover:text-red-400",
    wow: "text-amber-500 hover:text-amber-400",
    sad: "text-blue-500 hover:text-blue-400",
    angry: "text-orange-600 hover:text-orange-500"
  };

  const mediaTypeIcons: Record<string, React.ReactNode> = {
    book: <Book className="h-4 w-4 mr-1 text-blue-500" />,
    music: <Music className="h-4 w-4 mr-1 text-purple-500" />,
    movie: <Film className="h-4 w-4 mr-1 text-red-500" />,
    podcast: <Mic className="h-4 w-4 mr-1 text-green-500" />
  };

  // Safely create reactions array, handling potential undefined values
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

  // Early return with a default UI if post is malformed to prevent errors
  if (!post || !post.id) {
    return (
      <article className="bg-card rounded-2xl p-6 shadow-md border border-border">
        <p className="text-muted-foreground">Error loading post</p>
      </article>
    );
  }

  return (
    <article className={cn(
      "bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-border",
      compact ? "max-w-2xl" : "w-full"
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
            onClick={() => handleReaction('like')}
            className={cn(
              "inline-flex items-center text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.like ? "bg-primary/10 font-medium border-primary/30" : "border-border hover:bg-muted/50",
              reactionColors.like,
              isAnimating.like && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.like}
            {postReactions.like > 0 ? postReactions.like : "Like"}
          </button>
          <button 
            onClick={() => handleReaction('love')}
            className={cn(
              "inline-flex items-center text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.love ? "bg-red-500/10 font-medium border-red-500/30" : "border-border hover:bg-muted/50",
              reactionColors.love,
              isAnimating.love && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.love}
            {postReactions.love > 0 ? postReactions.love : "Love"}
          </button>
          <button 
            onClick={() => handleReaction('wow')}
            className={cn(
              "inline-flex items-center text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.wow ? "bg-amber-500/10 font-medium border-amber-500/30" : "border-border hover:bg-muted/50",
              reactionColors.wow,
              isAnimating.wow && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.wow}
            {postReactions.wow > 0 ? postReactions.wow : "Wow"}
          </button>
          <button 
            onClick={() => handleReaction('sad')}
            className={cn(
              "inline-flex items-center text-xs px-2 py-1 rounded-full border transition-all duration-200",
              activeReactions.sad ? "bg-blue-500/10 font-medium border-blue-500/30" : "border-border hover:bg-muted/50",
              reactionColors.sad,
              isAnimating.sad && "animate-[scale-in_0.2s_ease-out]"
            )}
          >
            {reactionIcons.sad}
            {postReactions.sad > 0 ? postReactions.sad : "Sad"}
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
          
          <CustomButton 
            variant="ghost" 
            size="sm"
          >
            <Share2 className="h-4 w-4" />
          </CustomButton>
        </div>
      </div>
    </article>
  );
};
