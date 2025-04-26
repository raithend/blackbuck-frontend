// components/follow/follow-cards.tsx
"use client";

import { useMemo, useState } from "react";
import { FollowCard } from "./follow-card";
import { User } from "@/types/user";

interface FollowCardsProps {
  initialUsers: User[];
  apiUrl: string;
}

export function FollowCards({ initialUsers = [], apiUrl }: FollowCardsProps) {
  const users = useMemo(() => initialUsers, [initialUsers]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const handleFollowStatusChange = (userId: string, isFollowing: boolean) => {
    setFollowing((prev) => {
      const newFollowing = new Set(prev);
      if (isFollowing) {
        newFollowing.add(userId);
      } else {
        newFollowing.delete(userId);
      }
      return newFollowing;
    });
  };

  if (!users || users.length === 0) {
    return <div>ユーザーが見つかりません</div>;
  }

  return (
    <div className="grid gap-2">
      {users.map((user) => (
        <FollowCard
          key={user.id}
          user={user}
          isFollowing={following.has(user.id)}
          apiUrl={apiUrl}
          onFollowStatusChange={handleFollowStatusChange}
        />
      ))}
    </div>
  );
}