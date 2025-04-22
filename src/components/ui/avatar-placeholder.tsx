
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarPlaceholderProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  name,
  size = 'md',
  className
}) => {
  // Generate a consistent color based on the name
  const getColorClass = (name: string) => {
    const colors = [
      'bg-lavender/20 text-lavender',
      'bg-emerald/20 text-emerald',
      'bg-cafe/20 text-cafe-dark'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl'
  };
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        getColorClass(name),
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
