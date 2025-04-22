
import { cn } from "@/lib/utils";

interface TagProps {
  text: string;
  color?: "default" | "primary" | "accent";
  onClick?: () => void;
  className?: string;
}

export function Tag({ 
  text, 
  color = "default", 
  onClick, 
  className 
}: TagProps) {
  const colorVariants = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent"
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        colorVariants[color],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={onClick}
    >
      {text}
    </span>
  );
}
