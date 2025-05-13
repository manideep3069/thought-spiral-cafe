
import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Edit, Save } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { AvatarPlaceholder } from '@/components/ui/avatar-placeholder';

interface ProfileHeaderProps {
  userProfile: any;
  currentUser: any | null;
  isEditMode: boolean;
  name: string;
  setName: (name: string) => void;
  isSubmitting: boolean;
  onEdit: () => void;
  onSave: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  currentUser,
  isEditMode,
  name,
  setName,
  isSubmitting,
  onEdit,
  onSave
}) => {
  const isOwnProfile = currentUser && currentUser.id === (userProfile?.id || '');
  
  return (
    <div className="relative mb-8">
      {/* Profile banner */}
      <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-lavender/30 to-emerald/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529697216570-d448c2f11e40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30"></div>
      </div>
      
      {/* Profile info */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-6 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end">
        {!isEditMode ? (
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-lavender/20 border-4 border-background flex items-center justify-center overflow-hidden">
            {userProfile.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt={name || userProfile.random_name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarPlaceholder 
                name={name || userProfile.random_name || 'User'} 
                size="lg" 
              />
            )}
          </div>
        ) : (
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-lavender/20 border-4 border-background flex items-center justify-center overflow-hidden">
            <AvatarPlaceholder name={name || 'User'} size="lg" />
          </div>
        )}
        
        <div className="mt-4 sm:mt-0 sm:ml-4 pb-4 text-center sm:text-left">
          {!isEditMode ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold">
                {userProfile.random_name || 'Anonymous User'}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                {userProfile.country && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userProfile.country}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {format(new Date(userProfile.created_at || new Date()), "MMMM yyyy")}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full sm:w-64">
              <Input 
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-serif font-bold text-lg"
              />
            </div>
          )}
        </div>
        
        {isOwnProfile && (
          <div className="ml-auto mt-4 sm:mt-0 pb-4">
            {!isEditMode ? (
              <CustomButton variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </CustomButton>
            ) : (
              <CustomButton 
                variant="accent" 
                size="sm" 
                onClick={onSave}
                isLoading={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </CustomButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
