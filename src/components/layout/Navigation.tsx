
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const useUnreadNotifications = () => {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("is_read")
        .eq("is_read", false);
      if (error) return [];
      return data ?? [];
    },
  });
  return (data?.length ?? 0) > 0;
};

export const Navigation: React.FC = () => {
  const location = useLocation();
  const hasUnread = useUnreadNotifications();

  const navLinks = [
    {
      to: "/",
      label: "Home",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      to: "/discover",
      label: "Discover",
      icon: <Search className="h-4 w-4 mr-2" />,
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: (
        <span className="relative">
          <Bell className="h-4 w-4 mr-2" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary shadow" />
          )}
        </span>
      ),
    },
  ];

  return (
    <nav className="hidden md:flex space-x-6 ml-6">
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`text-foreground hover:text-primary transition-colors flex items-center ${location.pathname === link.to ? "font-bold text-primary" : ""}`}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

