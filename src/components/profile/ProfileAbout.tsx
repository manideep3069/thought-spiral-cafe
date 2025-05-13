
import React from 'react';

interface ProfileAboutProps {
  userProfile: any;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({ userProfile }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-medium mb-4">About {userProfile.random_name || 'this user'}</h3>
      
      {userProfile.about ? (
        <p className="text-foreground whitespace-pre-line">{userProfile.about}</p>
      ) : (
        <p className="text-muted-foreground italic">No bio provided yet.</p>
      )}
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {userProfile.age && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
            <p>{userProfile.age}</p>
          </div>
        )}
        {userProfile.gender && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Gender</h4>
            <p>{userProfile.gender}</p>
          </div>
        )}
      </div>
    </div>
  );
};
