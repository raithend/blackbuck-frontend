import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/app/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import type { User } from "@/app/types/types";
import { FollowButton } from "./follow-button";

interface FollowCardProps {
	user: User;
}

export function FollowCard({
	user,
}: FollowCardProps) {
	return (
		<Card className="">
			<CardHeader className="flex flex-row items-center gap-4 py-2">
				<Avatar>
					<AvatarImage src={user.avatar_url || ""} alt={user.username} />
					<AvatarFallback>{user.username[0]}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<h3 className="text-lg font-semibold">{user.username}</h3>
					<p className="text-sm text-muted-foreground">@{user.account_id}</p>
				</div>
				<FollowButton
					targetAccountId={user.account_id}
					size="sm"
					variant="outline"
				/>
			</CardHeader>
			<CardContent className="py-2">
				<p className="text-sm text-muted-foreground">{user.bio}</p>
			</CardContent>
		</Card>
	);
}
