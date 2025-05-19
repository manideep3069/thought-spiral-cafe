
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { GroundRulesModal } from '@/components/auth/GroundRulesModal';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, hasAcceptedRules } = useAuth();
  const [showRulesModal, setShowRulesModal] = React.useState(false);
  
  React.useEffect(() => {
    // Only show rules modal for authenticated users who haven't accepted the rules
    if (user && !hasAcceptedRules) {
      setShowRulesModal(true);
    } else {
      setShowRulesModal(false);
    }
  }, [user, hasAcceptedRules]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // User exists, show content with rules modal if needed
  return (
    <>
      {children}
      {user && !hasAcceptedRules && (
        <GroundRulesModal 
          open={showRulesModal} 
          onOpenChange={setShowRulesModal} 
        />
      )}
    </>
  );
};
