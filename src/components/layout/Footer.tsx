
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GnL Café. All rights reserved.
          </p>
          <div className="mt-4 sm:mt-0 flex space-x-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Twitter
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
