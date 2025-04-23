
import React from "react";
import { Post, User, ReactionType } from "@/types";
import { getUserById } from "@/data/mockData";
import { CustomButton } from "@/components/ui/custom-button";
import { Tag } from "@/components/ui/tag";
import { format, isValid } from "date-fns";
import { Heart, MessageSquare, Share2, ThumbsUp, Frown, AlertCircle, Book, Music, Film, Mic } from "lucide-react";

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

  // Custom colors for reactions
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

  // Handle case where post.reactions might be undefined or null
  const reactions = post.reactions 
    ? Object.entries(post.reactions)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ReactionType,
        count
      }))
    : [];
    
  // Format the date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "Unknown date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

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
            {post.createdAt ? formatDate(post.createdAt) : "Unknown date"}
          </p>
        </div>
      </div>
      
      {/* Post title and content */}
      <h3 className="text-xl font-serif font-semibold mb-2">{post.title}</h3>
      
      {/* Media Type Badge */}
      {post.mediaMetadata?.type && post.mediaMetadata.type !== 'thought' && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
            {mediaTypeIcons[post.mediaMetadata.type] || null}
            {post.mediaMetadata.type}
          </span>
        </div>
      )}
      
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
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags && post.tags.length > 0 ? post.tags.map(tag => (
          <Tag key={tag} text={tag} color="primary" />
        )) : (
          <Tag text="general" color="default" />
        )}
      </div>
      
      {/* Reactions */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex flex-wrap gap-2">
          {/* Show reaction buttons */}
          <button 
            onClick={() => handleReaction('like')}
            className={`inline-flex items-center text-xs ${reactionColors.like} px-2 py-1 rounded-full border border-border hover:bg-muted/50`}
          >
            {reactionIcons.like}
            {reactions.find(r => r.type === 'like')?.count || 'Like'}
          </button>
          <button 
            onClick={() => handleReaction('love')}
            className={`inline-flex items-center text-xs ${reactionColors.love} px-2 py-1 rounded-full border border-border hover:bg-muted/50`}
          >
            {reactionIcons.love}
            {reactions.find(r => r.type === 'love')?.count || 'Love'}
          </button>
          <button 
            onClick={() => handleReaction('wow')}
            className={`inline-flex items-center text-xs ${reactionColors.wow} px-2 py-1 rounded-full border border-border hover:bg-muted/50`}
          >
            {reactionIcons.wow}
            {reactions.find(r => r.type === 'wow')?.count || 'Wow'}
          </button>
          <button 
            onClick={() => handleReaction('sad')}
            className={`inline-flex items-center text-xs ${reactionColors.sad} px-2 py-1 rounded-full border border-border hover:bg-muted/50`}
          >
            {reactionIcons.sad}
            {reactions.find(r => r.type === 'sad')?.count || 'Sad'}
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

// Import cn utility
import { cn } from "@/lib/utils";
