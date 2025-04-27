'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bird, Heart, Home, Settings, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { NavbarItem } from "./navbar-item";
import { AuthNavbarItem } from "./auth-navbar-item";
import { useUser } from "@/contexts/user-context";
import { ProfileNavbarItem } from "./profile-navbar-item";

export function Navbar() {
	const { user } = useUser();

	return (
		<div className="hidden md:block">
			<Card>
				<CardHeader className="flex flex-row items-center px-5 py-6">
					<Avatar>
						<Link href="/">
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>BB</AvatarFallback>
						</Link>
					</Avatar>
					<CardTitle className="hidden lg:block text-3xl ml-4">
						<Link href="/">Blackbuck</Link>
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0 flex flex-col">
					<NavbarItem label="ホーム" icon={Home} url="/" />
					<AuthNavbarItem label="フォロー" icon={UserRoundCheck} url={user?.id ? `/users/${user.id}/follows` : "/login"} />
					<AuthNavbarItem label="いいね" icon={Heart} url={user?.id ? `/users/${user.id}/likes` : "/login"} />
					<NavbarItem label="生物図鑑" icon={Bird} url="/species" />
					<AuthNavbarItem label="設定" icon={Settings} url={user?.id ? "/settings" : "/login"} />
					<ProfileNavbarItem />
				</CardContent>
			</Card>
		</div>
	);
}
