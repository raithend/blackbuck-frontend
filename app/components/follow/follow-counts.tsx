"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FollowCountsProps {
  accountId: string;
  followingCount: number;
  followerCount: number;
  className?: string;
}

export function FollowCounts({
  accountId,
  followingCount,
  followerCount,
  className,
}: FollowCountsProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleFollowingClick = () => {
    router.push(`/users/${accountId}/follows`);
  };

  const handleFollowersClick = () => {
    router.push(`/users/${accountId}/followers`);
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex justify-around space-x-4">
          <div
            className="flex flex-col items-center cursor-pointer transition-colors hover:text-primary"
            onClick={handleFollowingClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="text-2xl font-bold">{followingCount}</span>
            <span className="text-sm text-muted-foreground">フォロー中</span>
          </div>
          <div className="w-px bg-border" />
          <div
            className="flex flex-col items-center cursor-pointer transition-colors hover:text-primary"
            onClick={handleFollowersClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="text-2xl font-bold">{followerCount}</span>
            <span className="text-sm text-muted-foreground">フォロワー</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 