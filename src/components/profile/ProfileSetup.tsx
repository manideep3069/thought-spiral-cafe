import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileSetupProps {
  isOpen: boolean;
  onComplete: (userId: string) => void;
  onClose?: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ isOpen, onComplete, onClose }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const generateRandomName = () => {
    const adjectives = [
      'Curious', 'Thoughtful', 'Creative', 'Wise', 'Adventurous', 'Peaceful', 'Bold', 'Gentle',
      'Brave', 'Calm', 'Clever', 'Cool', 'Eager', 'Elegant', 'Epic', 'Fair', 'Free', 'Fresh',
      'Happy', 'Honest', 'Humble', 'Kind', 'Lively', 'Lucky', 'Merry', 'Nice', 'Noble', 'Open',
      'Proud', 'Quick', 'Quiet', 'Ready', 'Real', 'Rich', 'Safe', 'Sharp', 'Shy', 'Smart',
      'Strong', 'Swift', 'True', 'Unique', 'Warm', 'Wild', 'Young', 'Zen', 'Active', 'Agile',
      'Alert', 'Amazed', 'Aware', 'Bright', 'Clear', 'Direct', 'Dynamic', 'Easy', 'Exact',
      'Fast', 'Fine', 'Firm', 'Fit', 'Fluid', 'Focus', 'Full', 'Good', 'Great', 'Grown',
      'Hard', 'High', 'Huge', 'Ideal', 'Inner', 'Keen', 'Large', 'Light', 'Live', 'Long',
      'Loose', 'Loud', 'Low', 'Major', 'Mass', 'Max', 'Mean', 'Mega', 'Mild', 'Mini',
      'Mixed', 'Modal', 'Model', 'New', 'Next', 'Old', 'One', 'Only', 'Pure', 'Rare',
      'Raw', 'Real', 'Rich', 'Right', 'Solid', 'Sound', 'Super', 'Sure', 'Sweet', 'Top',
      'True', 'Ultra', 'United', 'Urban', 'Used', 'Valid', 'Vast', 'Vital', 'Vivid', 'Whole'
    ];
    
    const nouns = [
      'Thinker', 'Explorer', 'Dreamer', 'Wanderer', 'Observer', 'Creator', 'Seeker', 'Spirit',
      'Artist', 'Builder', 'Dancer', 'Fighter', 'Helper', 'Hunter', 'Leader', 'Learner',
      'Maker', 'Player', 'Reader', 'Runner', 'Singer', 'Teacher', 'Writer', 'Actor',
      'Angel', 'Bear', 'Bird', 'Cat', 'Dog', 'Eagle', 'Fox', 'Horse', 'Lion', 'Wolf',
      'Moon', 'Star', 'Sun', 'Wind', 'Fire', 'Ice', 'Rain', 'Snow', 'Storm', 'Wave',
      'Bridge', 'Castle', 'Forest', 'Garden', 'House', 'Island', 'Lake', 'Mountain', 'Ocean', 'River',
      'Bell', 'Book', 'Crown', 'Door', 'Flame', 'Gem', 'Key', 'Light', 'Mirror', 'Ring',
      'Shadow', 'Shield', 'Stone', 'Sword', 'Tower', 'Tree', 'Voice', 'Whisper', 'Wonder', 'Zone',
      'Ace', 'Boss', 'Chief', 'Duke', 'Elder', 'Fox', 'Guard', 'Hero', 'Icon', 'Judge',
      'King', 'Lord', 'Master', 'Noble', 'Oracle', 'Prince', 'Queen', 'Ruler', 'Sage', 'Titan',
      'Agent', 'Blade', 'Cipher', 'Dragon', 'Echo', 'Falcon', 'Ghost', 'Hawk', 'Iron', 'Jade',
      'Knight', 'Lance', 'Mage', 'Ninja', 'Opal', 'Pixel', 'Quest', 'Raven', 'Scout', 'Thunder'
    ];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj}${randomNoun}${randomNum}`;
  };

  const handleRandomName = () => {
    setName(generateRandomName());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !age || !rulesAccepted) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and accept the rules.",
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      toast({
        title: "Invalid Age",
        description: "Please enter a valid age between 13 and 120.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting profile creation...'); // Debug log

    try {
      // Generate a temporary user ID
      const tempUserId = crypto.randomUUID();
      console.log('Generated temp user ID:', tempUserId); // Debug log
      
      // Create profile in database
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: tempUserId,
          random_name: name.trim(),
          age: ageNum,
          rules_accepted: true,
          role: 'user'
        });

      console.log('Database insert result:', { error }); // Debug log

      if (error) {
        console.error('Profile creation error:', error);
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Store user ID in localStorage
      localStorage.setItem('tempUserId', tempUserId);
      localStorage.setItem('userProfile', JSON.stringify({
        id: tempUserId,
        name: name.trim(),
        age: ageNum
      }));

      console.log('Profile created successfully, calling onComplete'); // Debug log

      toast({
        title: "Welcome!",
        description: `Profile created successfully. Welcome, ${name}!`,
      });

      onComplete(tempUserId);
    } catch (error) {
      console.error('Unexpected error:', error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Let's get you started</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or username"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRandomName}
                className="px-3"
              >
                Random
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              min="13"
              max="120"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Community Guidelines</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Be respectful and kind to others</li>
                <li>• No harassment, hate speech, or harmful content</li>
                <li>• Share thoughtful and meaningful posts</li>
                <li>• Respect privacy and personal boundaries</li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rules"
                checked={rulesAccepted}
                onCheckedChange={(checked) => setRulesAccepted(checked as boolean)}
              />
              <Label htmlFor="rules" className="text-sm">
                I agree to follow the community guidelines
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !name.trim() || !age || !rulesAccepted}
          >
            {isSubmitting ? 'Creating Profile...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};