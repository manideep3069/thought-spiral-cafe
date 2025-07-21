
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/custom-button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface NewThoughtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewThoughtModal: React.FC<NewThoughtModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // Random name generator
  const getRandomName = () => {
    const adjectives = [
      "Thoughtful", "Curious", "Wandering", "Reflective", "Deep", "Bright", "Gentle", "Wise", "Kind", "Bold",
      "Peaceful", "Creative", "Inspiring", "Humble", "Patient", "Brave", "Calm", "Joyful", "Grateful", "Mindful",
      "Hopeful", "Serene", "Vibrant", "Earnest", "Sincere", "Radiant", "Tender", "Honest", "Devoted", "Gracious",
      "Loyal", "Noble", "Pure", "Steady", "True", "Warm", "Zealous", "Ambitious", "Cheerful", "Confident",
      "Determined", "Energetic", "Friendly", "Generous", "Happy", "Independent", "Intelligent", "Lively", "Motivated", "Optimistic"
    ];
    
    const nouns = [
      "Thinker", "Dreamer", "Explorer", "Seeker", "Observer", "Listener", "Writer", "Artist", "Philosopher", "Scholar",
      "Wanderer", "Creator", "Builder", "Helper", "Teacher", "Student", "Friend", "Guide", "Mentor", "Spirit",
      "Soul", "Heart", "Mind", "Voice", "Light", "Star", "Moon", "Sun", "River", "Ocean",
      "Mountain", "Forest", "Garden", "Flower", "Tree", "Bird", "Butterfly", "Feather", "Cloud", "Wind",
      "Storm", "Rainbow", "Dawn", "Dusk", "Horizon", "Journey", "Path", "Bridge", "Key", "Door"
    ];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective} ${randomNoun}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('posts').insert({
        content: content.trim(),
        user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Default UUID if no user
        is_open_for_discussion: true,
        media_title: title.trim(),
        media_type: 'thought'
      });

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create thought. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your thought has been shared!",
        });
        setTitle("");
        setContent("");
        onClose();
        // Reload to show the new post
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Share a New Thought</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Input
              placeholder="Title of your thought"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <CustomButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              isLoading={isSubmitting}
            >
              Share Thought
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
