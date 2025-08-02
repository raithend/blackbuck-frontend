"use client";

import type { PostWithUser } from "@/app/types/types";
import { PostCard } from "./post-card";

interface PostCardsProps {
	posts: PostWithUser[];
	onLikeChange?: (postId: string, likeCount: number, isLiked: boolean) => void;
	onPostUpdate?: (postId: string) => void;
	onPostDelete?: (postId: string) => void;
}

export function PostCards({
	posts,
	onLikeChange,
	onPostUpdate,
	onPostDelete,
}: PostCardsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{posts.map((post) => (
				<PostCard
					key={post.id}
					post={post}
					onLikeChange={onLikeChange}
					onPostUpdate={onPostUpdate}
					onPostDelete={onPostDelete}
				/>
			))}
		</div>
	);
}
