import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import { FollowButton } from "./follow-button";

interface FollowCardProps {
  user: User;
  isFollowing: boolean;
  apiUrl: string;
  onFollowStatusChange: (userId: string, isFollowing: boolean) => void;
}

export function FollowCard({ user, isFollowing, apiUrl, onFollowStatusChange }: FollowCardProps) {
  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center gap-4 py-2">
        <Avatar>
          <AvatarImage src={user.avatar_url} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">@{user.id}</p>
        </div>
        <FollowButton
          isFollowing={isFollowing}
          userId={user.id}
          apiUrl={apiUrl}
          onFollowStatusChange={onFollowStatusChange}
        />
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm text-muted-foreground">{user.bio}</p>
      </CardContent>
    </Card>
  );
} 