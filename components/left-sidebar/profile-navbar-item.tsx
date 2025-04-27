'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { AuthNavbarItem } from "./auth-navbar-item";
import { useProfile } from "@/contexts/profile-context";

export function ProfileNavbarItem() {
	const { profile } = useProfile();

	const ProfileIcon = () => {
		if (profile) {
			return (
				<Avatar>
					<AvatarImage src={profile.avatar_url} />
					<AvatarFallback><UserRound /></AvatarFallback>
				</Avatar>
			);
		}
		return <UserRound />;
	};

	return (
		<AuthNavbarItem label="プロフィール" icon={ProfileIcon} url={profile?.id ? "/[id]" : "/login"} />
	);
}
