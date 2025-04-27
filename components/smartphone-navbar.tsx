'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Bird, Heart, Home, Settings, UserRoundCheck } from "lucide-react";
import { NavbarItem } from "./left-sidebar/navbar-item";
import { AuthNavbarItem } from "./left-sidebar/auth-navbar-item";
import { useUser } from "@/contexts/user-context";

export function SmartphoneNavbar() {
	const { user } = useUser();

	return (
		<div>
			<Card className="rounded-none">
				<CardContent className="flex justify-between p-2">
				<NavbarItem label="ホーム" icon={Home} url="/" />
					<AuthNavbarItem label="フォロー" icon={UserRoundCheck} url={user?.id ? `/users/${user.id}/follows` : "/login"} />
					<AuthNavbarItem label="通知" icon={Bell} url= {user?.id ? `/notifications` : "/login"} />
					<AuthNavbarItem label="いいね" icon={Heart} url={user?.id ? `/users/${user.id}/likes` : "/login"} />
					<NavbarItem label="生物図鑑" icon={Bird} url="/species" />
					<AuthNavbarItem label="設定" icon={Settings} url={user?.id ? "/settings" : "/login"} />
				</CardContent>
			</Card>
		</div>
	);
}
