"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import type { User } from "@/app/types/types";
import Link from "next/link";
import { FollowButton } from "../follow/follow-button";

interface CreatorCardProps {
	user: User;
	className?: string;
}

export function CreatorCard({ user, className = "" }: CreatorCardProps) {
	// ユーザー情報が不完全な場合は表示しない
	if (!user || !user.account_id) {
		return null;
	}

	return (
		<Card className={`w-64 ${className}`}>
			<CardContent className="p-3">
				<div className="flex items-center gap-3">
					<div className="text-xs text-muted-foreground">作成者</div>
					<Link href={`/users/${user.account_id}`}>
						<Avatar className="h-6 w-6">
							<AvatarImage src={user.avatar_url || ""} alt={user.username} />
							<AvatarFallback>
								{user.username ? user.username[0] : "U"}
							</AvatarFallback>
						</Avatar>
					</Link>
					<div className="flex-1 min-w-0">
						<Link href={`/users/${user.account_id}`} className="block">
							<h4 className="text-sm font-medium truncate">
								{user.username || "Unknown User"}
							</h4>
							<p className="text-xs text-muted-foreground truncate">
								@{user.account_id}
							</p>
						</Link>
					</div>
					<FollowButton
						targetAccountId={user.account_id}
						size="sm"
						variant="outline"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
