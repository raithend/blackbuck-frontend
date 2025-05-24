import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditProfileButton } from "./edit-profile-button";

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    avatar_url?: string;
    header_url?: string;
    bio?: string;
  } | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  if (!profile) return null;

  return (
    <Card className="relative">
      <div 
        className="h-32 bg-gradient-to-r from-blue-500 to-purple-500"
        style={profile.header_url ? { backgroundImage: `url(${profile.header_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
      <div className="px-4 pb-4">
        <div className="relative -mt-16">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback>{profile.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <p className="text-muted-foreground">@{profile.id}</p>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
          </div>
          <EditProfileButton />
        </div>
      </div>
    </Card>
  );
} 