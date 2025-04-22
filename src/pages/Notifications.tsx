
import React, { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NotificationCard, Notification } from "@/components/notifications/NotificationCard";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Notification[];
};

const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  if (error) throw new Error(error.message);
};

const markAllNotificationsRead = async () => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  if (error) throw new Error(error.message);
};

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const mutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    meta: {
      onError: (error: any) => {
        toast.error(error.message ?? "Error updating notification.");
      },
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Marked all as read");
    },
    meta: {
      onError: (error: any) => {
        toast.error(error.message ?? "Error marking all as read.");
      },
    },
  });

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        mutation.mutate(notification.id);
      }
      // Custom navigation based on entity type
      switch (notification.entity_type) {
        case "post":
        case "thread":
          navigate(`/thread/${notification.entity_id}`);
          break;
        case "reply":
          navigate(`/thread/${notification.entity_id}`); // Adjust if reply navigation differs
          break;
        default:
          break;
      }
    },
    [mutation, navigate]
  );

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <button
            className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted-foreground/10 text-primary font-medium transition disabled:opacity-60"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending || Boolean(!notifications?.length)}
          >
            Mark all as read
          </button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 flex justify-center text-muted-foreground">
              Loading...
            </div>
          )}
          {isError && (
            <div className="py-8 text-destructive">{(error as Error)?.message}</div>
          )}
          {(!notifications || notifications.length === 0) && !isLoading && (
            <div className="py-8 text-center text-muted-foreground">
              No notifications yet.
            </div>
          )}
          <div className="space-y-2">
            {(notifications ?? []).map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
