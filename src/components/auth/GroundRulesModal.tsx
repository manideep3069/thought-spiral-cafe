
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroundRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GroundRulesModal: React.FC<GroundRulesModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAccept = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ rules_accepted: true })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Welcome to the Spiral",
        description: "You have accepted the covenant.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error accepting rules:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept the rules. Please try again.",
      });
    }
  };

  const handleDecline = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast({
      description: "You've chosen to decline. The door remains closed.",
    });
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-serif text-center">
            🕊 The Covenant of the Spiral
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 text-base">
            <p className="italic text-center border-b pb-4">
              "Man is not born to float, but to descend into the depth of thought—there he discovers himself."
              <br />— Inspired by Nietzsche
            </p>
            
            <p className="pt-2">
              Before you sip from the well of the Café, a covenant must be made.
            </p>
            
            <p>
              Within these walls, we do not trade noise for noise. We think. We feel. 
              We express with reverence for words, for time, and for one another. 
              This is not a stage for vanity nor a market for validation. It is a 
              sanctuary for those who dare to reflect, to doubt, to seek.
            </p>
            
            <p>
              You are not asked to agree with all who gather here—only to honor them as seekers, as you are.
            </p>
            
            <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
              <h3 className="text-lg font-medium mb-2">Do you accept the Ground Rules of Thought Spiral Café?</h3>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDecline}>
            No, I do not accept — Then let this door remain closed
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>
            Yes, I accept — I step consciously into the spiral
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
