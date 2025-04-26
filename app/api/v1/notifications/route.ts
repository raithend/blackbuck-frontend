import { NextResponse } from "next/server";
import { Notification } from "@/types/notification";

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "follow",
    actor: {
      id: "user1",
      username: "ユーザー1",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5分前
  },
  {
    id: "2",
    type: "like",
    actor: {
      id: "user2",
      username: "ユーザー2",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
  },
  {
    id: "3",
    type: "comment",
    actor: {
      id: "user3",
      username: "ユーザー3",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1時間前
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filteredNotifications = dummyNotifications;

  if (type && type !== "all") {
    filteredNotifications = dummyNotifications.filter(
      (notification) => notification.type === type
    );
  }

  return NextResponse.json(filteredNotifications);
} 