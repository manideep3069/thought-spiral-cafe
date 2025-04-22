
import React from "react";
import { Bell, MessageSquare, Heart, ThumbsUp, ThumbsDown, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type NotificationType = "reaction" | "reply" | "thread" | "like";

export interface Notification {
  id: string;
  type: NotificationType;
  entity_type: string;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  actor_id?: string | null;
}

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  reaction: <Heart className="w-5 h-5 text-primary" />,
  like: <ThumbsUp className="w-5 h-5 text-primary" />,
  reply: <MessageSquare className="w-5 h-5 text-primary" />,
  thread: <Users className="w-5 h-5 text-primary" />,
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick
}) => {
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-md border shadow hover:bg-muted transition cursor-pointer group",
        !notification.is_read && "bg-lavender/10 border-primary"
      )}
    >
      <div className="shrink-0 flex items-center justify-center">
        {iconMap[notification.type] ?? <Bell className="w-5 h-5 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground font-medium">
          {notification.message ?? "You have a new notification"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.created_at ? new Date(notification.created_at) : new Date(), { addSuffix: true })}
        </div>
      </div>
      {!notification.is_read && (
        <span className="ml-2 mt-1 w-2 h-2 rounded-full bg-primary block" />
      )}
    </div>
  );
};
