
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GnL Café. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
