
import React from 'react';
import { Globe, GraduationCap, MessageCircle, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomButton } from '@/components/ui/custom-button';
import { FormDescription } from '@/components/ui/form';

interface ProfileEditFormProps {
  about: string;
  setAbout: (about: string) => void;
  age: string;
  setAge: (age: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  country: string;
  setCountry: (country: string) => void;
  dailyQuote: { text: string; author: string };
  onCancel: () => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  about, 
  setAbout,
  age, 
  setAge,
  gender, 
  setGender,
  country, 
  setCountry,
  dailyQuote,
  onCancel,
  onSave,
  isSubmitting
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      {/* Daily Quote for Intellectual Inspiration */}
      {dailyQuote.text && (
        <div className="bg-gradient-to-r from-lavender/10 to-emerald/10 p-6 rounded-xl mb-6">
          <p className="text-lg italic font-serif mb-2">&ldquo;{dailyQuote.text}&rdquo;</p>
          <p className="text-right text-sm font-medium">— {dailyQuote.author}</p>
        </div>
      )}
      
      <h3 className="text-lg font-medium mb-4">Define Your Existence</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <label className="text-sm font-medium">Geographic Locus</label>
            </div>
            <Input 
              placeholder="Your country of residence or origin"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <FormDescription>The terrestrial context that frames your perspective</FormDescription>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <label className="text-sm font-medium">Temporal Journey</label>
              </div>
              <Input 
                type="number"
                placeholder="Your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <FormDescription>The sum of your years</FormDescription>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <label className="text-sm font-medium">Identity Expression</label>
              </div>
              <Input 
                placeholder="Your gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
              <FormDescription>How you perceive your essence</FormDescription>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <label className="text-sm font-medium">Philosophical Contemplations</label>
          </div>
          <Textarea 
            placeholder="Share your intellectual perspectives, interests, and the questions that occupy your thoughts..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="min-h-[150px]"
          />
          <FormDescription>Express your worldview, intellectual interests, and the queries that animate your being</FormDescription>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <CustomButton 
          variant="outline" 
          onClick={onCancel}
        >
          Abandon
        </CustomButton>
        <CustomButton 
          onClick={onSave}
          isLoading={isSubmitting}
        >
          Immortalize
        </CustomButton>
      </div>
    </div>
  );
};
