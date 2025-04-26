import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { FollowButton } from "./follow-button";

interface FollowCardProps {
  user: User;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  isFollowing: boolean;
}

export function FollowCard({ user, onFollow, onUnfollow, isFollowing }: FollowCardProps) {
  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center gap-4 py-2">
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
        <FollowButton
          isFollowing={isFollowing}
          onFollow={() => onFollow(user.id)}
          onUnfollow={() => onUnfollow(user.id)}
        />
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm text-muted-foreground">{user.bio}</p>
      </CardContent>
    </Card>
  );
} 