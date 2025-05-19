
import React from 'react';

interface ProfileTabsProps {
  activeTab: 'thoughts' | 'about';
  setActiveTab: (tab: 'thoughts' | 'about') => void;
  postsCount: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeTab, 
  setActiveTab,
  postsCount
}) => {
  return (
    <div className="border-b border-border mb-8">
      <div className="flex space-x-8">
        <button
          className={`pb-4 font-medium text-sm relative ${
            activeTab === 'thoughts' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('thoughts')}
        >
          Thoughts ({postsCount})
        </button>
        <button
          className={`pb-4 font-medium text-sm relative ${
            activeTab === 'about' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>
    </div>
  );
};
