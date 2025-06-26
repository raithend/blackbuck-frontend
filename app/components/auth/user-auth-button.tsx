"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Skeleton } from "@/app/components/ui/skeleton";
import { LogoutButton } from "@/app/components/auth/logout-button";
import { useUser } from "@/app/contexts/user-context";
import { Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserAuthButton() {
	const { user, loading } = useUser();
	const router = useRouter();

	if (loading) {
		return (
			<Button variant="ghost" size="sm" disabled>
				<Skeleton className="h-8 w-8 rounded-full" />
			</Button>
		);
	}

	if (!user) {
		return (
			<Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
				ログイン
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarImage src={user.avatar_url || undefined} alt={user.username} />
						<AvatarFallback>
							{user.username ? user.username.charAt(0).toUpperCase() : "U"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.username}</p>
						<p className="text-xs leading-none text-muted-foreground">
							@{user.account_id}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => router.push(`/users/${user.account_id}`)}>
					<User className="mr-2 h-4 w-4" />
					<span>プロフィール</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => router.push("/settings")}>
					<Settings className="mr-2 h-4 w-4" />
					<span>設定</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<LogoutButton />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
