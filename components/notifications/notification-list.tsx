"use client";

import { NotificationItem } from "./notification-item";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationListProps {
  type: "all" | "follows" | "likes" | "comments";
}

export function NotificationList({ type }: NotificationListProps) {
  const { notifications, loading, error } = useNotifications(type);

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div className="text-red-500">エラー: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div>通知はありません</div>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
} 