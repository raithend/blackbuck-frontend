// components/follow/follow-cards.tsx
"use client";

import type { User } from "@/app/types/types";
import { useMemo } from "react";
import { FollowCard } from "./follow-card";

interface FollowCardsProps {
	initialUsers: User[];
}

export function FollowCards({ initialUsers = [] }: FollowCardsProps) {
	const users = useMemo(() => initialUsers, [initialUsers]);

	if (!users || users.length === 0) {
		return <div>follow cards</div>;
	}

	return (
		<div className="grid gap-2">
			{users.map((user) => (
				<FollowCard
					key={user.id}
					user={user}
				/>
			))}
		</div>
	);
}
