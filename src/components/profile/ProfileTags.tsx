
import React from 'react';
import { Tag } from '@/components/ui/tag';

interface ProfileTagsProps {
  tags?: string[];
}

export const ProfileTags: React.FC<ProfileTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="mb-8 flex flex-wrap gap-2 justify-center sm:justify-start">
      {tags.map((tag) => (
        <Tag key={tag} text={tag} color="primary" className="capitalize" />
      ))}
    </div>
  );
};
