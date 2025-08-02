"use client";

import { FollowButton } from "@/app/components/follow/follow-button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import type { User } from "@/app/types/types";
import Link from "next/link";

interface UserCardsProps {
	users: User[];
	type: "following" | "followers";
}

export function UserCards({ users, type }: UserCardsProps) {
	if (users.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600">
					{type === "following"
						? "フォロー中のユーザーはいません"
						: "フォロワーはいません"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{users.map((user) => (
				<Card key={user.id} className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<Link
								href={`/users/${user.account_id}`}
								className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
							>
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={user.avatar_url || undefined}
										alt={user.username || user.account_id}
									/>
									<AvatarFallback>
										{user.username?.charAt(0) || user.account_id.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-lg truncate">
										{user.username || user.account_id}
									</h3>
									{user.bio && (
										<p className="text-sm text-gray-600 truncate">{user.bio}</p>
									)}
								</div>
							</Link>
							<div className="flex-shrink-0">
								<FollowButton
									targetAccountId={user.account_id}
									size="sm"
									variant="outline"
								/>
							</div>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
