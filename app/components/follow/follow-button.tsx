import { Button } from "@/app/components/ui/button";

interface FollowButtonProps {
  isFollowing: boolean;
  userId: string;
  apiUrl: string;
  onFollowStatusChange: (userId: string, isFollowing: boolean) => void;
}

export function FollowButton({ isFollowing, userId, apiUrl, onFollowStatusChange }: FollowButtonProps) {
  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('フォローに失敗しました');
      }

      onFollowStatusChange(userId, true);
    } catch (err) {
      // エラー処理
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('フォロー解除に失敗しました');
      }

      onFollowStatusChange(userId, false);
    } catch (err) {
      // エラー処理
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