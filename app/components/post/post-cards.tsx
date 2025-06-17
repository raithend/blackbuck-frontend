"use client";

import type { PostWithUser } from "@/app/types/types";
import { PostCard } from "./post-card";

interface PostCardsProps {
	posts: PostWithUser[];
}

export function PostCards({ posts }: PostCardsProps) {
	if (posts.length === 0) return <div>投稿がありません</div>;

	return (
		<div className="grid gap-2">
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
}
