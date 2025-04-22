
import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar: React.FC = () => {
  return (
    <div className="relative">
      <input 
        type="text" 
        placeholder="Search..." 
        className="w-32 md:w-48 h-9 px-3 rounded-full bg-muted text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
};
