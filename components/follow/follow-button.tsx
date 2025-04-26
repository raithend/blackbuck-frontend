import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  isFollowing: boolean;
  userId: string;
  apiUrl: string;
  onFollowStatusChange: (userId: string, isFollowing: boolean) => void;
}

export function FollowButton({ isFollowing, userId, apiUrl, onFollowStatusChange }: FollowButtonProps) {
  const handleFollow = async () => {
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

      onFollowStatusChange(userId, true);
    } catch (err) {
      console.error("フォローエラー:", err);
    }
  };

  const handleUnfollow = async () => {
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

      onFollowStatusChange(userId, false);
    } catch (err) {
      console.error("フォロー解除エラー:", err);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={isFollowing ? handleUnfollow : handleFollow}
      className="w-24"
    >
      {isFollowing ? "フォロー中" : "フォロー"}
    </Button>
  );
} 