"use client";

import { useEffect, useState } from "react";
import { FollowCard } from "./follow-card";

interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

interface FollowCardsProps {
  apiUrl: string;
}

export function FollowCards({ apiUrl }: FollowCardsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("ユーザーデータの取得に失敗しました");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("フォローに失敗しました");
      }

      setFollowing((prev) => new Set([...prev, userId]));
    } catch (err) {
      console.error("フォローエラー:", err);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("フォロー解除に失敗しました");
      }

      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (err) {
      console.error("フォロー解除エラー:", err);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid gap-2">
      {users.map((user) => (
        <FollowCard
          key={user.id}
          user={user}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          isFollowing={following.has(user.id)}
        />
      ))}
    </div>
  );
} 