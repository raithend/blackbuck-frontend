import { useState, useEffect } from "react";
import { Notification } from "@/types/notification";

type NotificationType = "all" | "follows" | "likes" | "comments";

export function useNotifications(type: NotificationType) {
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

  return { notifications, loading, error };
} 