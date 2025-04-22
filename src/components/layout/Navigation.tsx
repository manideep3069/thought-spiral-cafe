
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Bell } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="hidden md:flex space-x-6 ml-6">
      <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center">
        <Home className="h-4 w-4 mr-2" />
        Home
      </Link>
      <Link to="/discover" className="text-foreground hover:text-primary transition-colors flex items-center">
        <Search className="h-4 w-4 mr-2" />
        Discover
      </Link>
      <Link to="/notifications" className="text-foreground hover:text-primary transition-colors flex items-center">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </Link>
    </nav>
  );
};
