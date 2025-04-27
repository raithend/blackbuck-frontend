'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Bird, Heart, Home, Settings, UserRoundCheck } from "lucide-react";
import { NavbarItem } from "./left-sidebar/navbar-item";
import { AuthNavbarItem } from "./left-sidebar/auth-navbar-item";
import { useProfile } from "@/contexts/profile-context";

export function SmartphoneNavbar() {
	const { profile } = useProfile();

	return (
		<div>
			<Card className="rounded-none">
				<CardContent className="flex justify-between p-2">
				<NavbarItem label="ホーム" icon={Home} url="/" />
					<AuthNavbarItem label="フォロー" icon={UserRoundCheck} url={profile?.id ? "/[id]/follows" : "/login"} />
					<AuthNavbarItem label="通知" icon={Bell} url= {profile?.id ? "/[id]/notifications" : "/login"} />
					<AuthNavbarItem label="いいね" icon={Heart} url={profile?.id ? "/[id]/likes" : "/login"} />
					<NavbarItem label="生物図鑑" icon={Bird} url="/species" />
					<AuthNavbarItem label="設定" icon={Settings} url={profile?.id ? "/settings" : "/login"} />
				</CardContent>
			</Card>
		</div>
	);
}
