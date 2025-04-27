'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { AuthNavbarItem } from "./auth-navbar-item";
import { useUser } from "@/contexts/user-context";

export function ProfileNavbarItem() {
	const { user } = useUser();

	const ProfileIcon = () => {
		if (user) {
			return (
				<Avatar className="w-8 h-8">
					<AvatarImage src={user.avatar_url ?? undefined}/>
					<AvatarFallback><UserRound className="w-8 h-8"/></AvatarFallback>
				</Avatar>
			);
		}
		return <UserRound className="w-8 h-8"/>;
	};

	return (
		<AuthNavbarItem label="プロフィール" icon={ProfileIcon} url={user?.id ? `/users/${user.id}` : "/login"} />
	);
}
