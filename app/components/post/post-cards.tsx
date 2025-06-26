"use client";

import type { PostWithUser } from "@/app/types/types";
import { PostCard } from "./post-card";

interface PostCardsProps {
	posts: PostWithUser[];
	onLikeChange?: (postId: string, likeCount: number, isLiked: boolean) => void;
}

export function PostCards({ posts, onLikeChange }: PostCardsProps) {
	if (posts.length === 0) return <div>投稿がありません</div>;

	return (
		<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
			{posts.map((post) => (
				<PostCard 
					key={post.id} 
					post={post} 
					onLikeChange={onLikeChange}
				/>
			))}
		</div>
	);
}
