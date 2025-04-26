import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

export function FollowButton({ isFollowing, onFollow, onUnfollow }: FollowButtonProps) {
  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={isFollowing ? onUnfollow : onFollow}
      className="w-24"
    >
      {isFollowing ? "フォロー中" : "フォロー"}
    </Button>
  );
} 