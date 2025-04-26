"use client";

import { useEffect, useState } from "react";
import { Notification } from "@/types/notification";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  type: "all" | "follows" | "likes" | "comments";
}

export function NotificationList({ type }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/v1/notifications?type=${type}`);
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("通知の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [type]);

  if (loading) {
    return <div>読み込み中...</div>;
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