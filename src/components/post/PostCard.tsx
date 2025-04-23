
import React from "react";
import { Post, User, ReactionType } from "@/types";
import { getUserById } from "@/data/mockData";
import { CustomButton } from "@/components/ui/custom-button";
import { Tag } from "@/components/ui/tag";
import { format } from "date-fns";
import { Heart, MessageSquare, Share2, ThumbsUp, Frown, AlertCircle } from "lucide-react";

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
  
  const handleReaction = (type: ReactionType) => {
    // This will be implemented with Supabase later
    console.log(`Reacted with ${type} to post ${post.id}`);
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

  // Handle case where post.reactions might be undefined or null
  const reactions = post.reactions 
    ? Object.entries(post.reactions)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ReactionType,
        count
      }))
    : [];

  return (
    <article className={cn(
      "bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-border",
      compact ? "max-w-2xl" : "w-full"
    )}>
      {/* Author info */}
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
            {format(new Date(post.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      
      {/* Post title and content */}
      <h3 className="text-xl font-serif font-semibold mb-2">{post.title}</h3>
      
      {/* Show quote if available */}
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
      
      {/* Media metadata */}
      {post.mediaMetadata && post.mediaMetadata.type !== 'quote' && (
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
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags && post.tags.map(tag => (
          <Tag key={tag} text={tag} color="primary" />
        ))}
      </div>
      
      {/* Reactions */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-2">
          {reactions.length > 0 ? (
            reactions.map(reaction => (
              <button 
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2 py-1 rounded-full"
              >
                {reactionIcons[reaction.type]}
                {reaction.count}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No reactions yet</span>
          )}
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

// Import cn utility
import { cn } from "@/lib/utils";
