"use client";

import { Notification } from "@/types/notification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const getNotificationText = () => {
    switch (notification.type) {
      case "follow":
        return `${notification.actor.username}があなたをフォローしました`;
      case "like":
        return `${notification.actor.username}があなたの投稿にいいねしました`;
      case "comment":
        return `${notification.actor.username}があなたの投稿にコメントしました`;
      default:
        return "";
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      <Avatar>
        <AvatarImage src={notification.actor.avatar_url} />
        <AvatarFallback>{notification.actor.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm">{getNotificationText()}</p>
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: ja,
          })}
        </p>
      </div>
    </div>
  );
} 