'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart, Home, Settings, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { NavbarItem } from "./left-sidebar/navbar-item";
import { UseNavbarItem } from "./left-sidebar/use-navbar-item";
import { usePathname } from "next/navigation";

export function SmartphoneNavbar() {
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	const isFollowPage = pathname.includes("/follow");
	const isNotificationPage = pathname.includes("/notification");
	const isLikePage = pathname.includes("/like");
	const isSettingPage = pathname.includes("/setting");

	return (
		<div>
			<Card className="rounded-none">
				<CardContent className="flex justify-between p-2">
					<Link href="/">
						<NavbarItem label="ホーム" icon={Home} active={isHomePage} />
					</Link>
					<Link href="./follow">
						<NavbarItem 
							label="フォロー" 
							icon={UserRoundCheck} 
							active={isFollowPage}
						/>
					</Link>
					<Link href="./notification">
						<NavbarItem 
							label="通知" 
							icon={Bell} 
							active={isNotificationPage}
						/>
					</Link>
					<Link href="./like">
						<NavbarItem 
							label="いいね" 
							icon={Heart} 
							active={isLikePage}
						/>
					</Link>
					<Link href="./setting">
						<NavbarItem 
							label="設定" 
							icon={Settings} 
							active={isSettingPage}
						/>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
