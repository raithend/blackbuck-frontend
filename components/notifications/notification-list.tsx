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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/notifications?type=${type}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("APIがJSONを返していません");
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("通知の取得に失敗しました:", error);
        setError(error instanceof Error ? error.message : "通知の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [type]);

  if (loading) {
    return <div>読み込み中...</div>;
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